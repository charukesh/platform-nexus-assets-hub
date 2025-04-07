
import { supabase } from "@/integrations/supabase/client";
import { 
  enhanceAsset, 
  enhancePlatform, 
  parseAudienceData 
} from "@/utils/campaignUtils";
import { 
  Asset, 
  CampaignData, 
  PlatformDbRecord, 
  PlatformWithAssets 
} from "@/types/campaign";
import { getPlatformWithAssets } from "./platformService";

// Use export type for re-exporting types when isolatedModules is enabled
export type { Asset, PlatformDbRecord, PlatformWithAssets };
export { getPlatformWithAssets };

export const generateCampaignQuotation = async (
  data: CampaignData
): Promise<{ 
  platforms: PlatformWithAssets[]; 
  totalCost: number; 
  totalImpressions: number;
  campaignDays: number;
}> => {
  // Get campaign days directly from the data
  const campaignDays = data?.durationDays || 1;

  // Ensure there are selected platforms
  if (!data?.platformPreferences || !data.platformPreferences.length) {
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays 
    };
  }

  try {
    // Step 1: Primary Filtering - Fetch platforms and assets
    const { data: platformsData, error: platformsError } = await supabase
      .from("platforms")
      .select("*")
      .in("id", data.platformPreferences);

    if (platformsError) throw platformsError;
    if (!platformsData || platformsData.length === 0) {
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Make sure we have assetCategories to filter by
    const assetCategories = data.assetCategories || [];

    const { data: assetsData, error: assetsError } = await supabase
      .from("assets")
      .select("*")
      .in("platform_id", data.platformPreferences);

    if (assetsError) throw assetsError;
    
    // Ensure assetsData is an array
    const assets = assetsData || [];

    // Filter assets by category if categories are provided
    const filteredAssets = assetCategories.length > 0 
      ? assets.filter(asset => assetCategories.includes(asset.category || ''))
      : assets;
    
    // Apply cost and impressions to assets (simulated for now)
    const processedAssets = filteredAssets.map(asset => enhanceAsset({
      ...asset,
      cost_per_day: asset.cost_per_day || Math.floor(Math.random() * 15000) + 5000,
      estimated_impressions: asset.estimated_impressions || Math.floor(Math.random() * 90000) + 10000,
      targeting_score: asset.targeting_score || 1.0,
    }));

    // Step 3: Targeting-Based Scoring
    // Calculate a matching score for each asset based on demographics, geographics, etc.
    const scoredAssets = processedAssets.map(asset => {
      // Start with a base score
      let score = 1.0;

      // Get the associated platform for the asset
      const platform = platformsData.find(p => p.id === asset.platform_id);
      
      // If we have audience data for the platform, use it for scoring
      if (platform?.audience_data) {
        // Process audience data to ensure correct type
        const audienceData = parseAudienceData(platform.audience_data);
        
        if (audienceData) {
          // Check demographic matches (age groups)
          if (audienceData.demographic?.ageGroups && 
              data.demographics?.ageGroups?.length > 0) {
            const ageGroupMatch = data.demographics.ageGroups.some(
              age => audienceData.demographic?.ageGroups?.includes(age)
            );
            if (ageGroupMatch) score += 0.2;
          }
          
          // Check gender matches
          if (audienceData.demographic?.gender && 
              data.demographics?.gender?.length > 0) {
            const genderMatch = data.demographics.gender.some(
              gender => audienceData.demographic?.gender?.includes(gender)
            );
            if (genderMatch) score += 0.2;
          }
          
          // Check interest matches
          if (audienceData.demographic?.interests && 
              data.demographics?.interests?.length > 0) {
            const interestMatch = data.demographics.interests.some(
              interest => audienceData.demographic?.interests?.includes(interest)
            );
            if (interestMatch) score += 0.2;
          }
          
          // Check geographic matches (cities)
          if (audienceData.geographic?.cities && 
              data.geographics?.cities?.length > 0) {
            const cityMatch = data.geographics.cities.some(
              city => audienceData.geographic?.cities?.includes(city)
            );
            if (cityMatch) score += 0.2;
          }
          
          // Check geographic matches (states)
          if (audienceData.geographic?.states && 
              data.geographics?.states?.length > 0) {
            const stateMatch = data.geographics.states.some(
              state => audienceData.geographic?.states?.includes(state)
            );
            if (stateMatch) score += 0.2;
          }
        }
      }
      
      // Additional factors could include:
      // - Tags matching campaign objectives
      // - Asset performance history
      // - Seasonal relevance
      
      return {
        ...asset,
        targeting_score: score
      };
    });

    // Sort assets by targeting score (descending)
    scoredAssets.sort((a, b) => 
      (b.targeting_score || 0) - (a.targeting_score || 0)
    );

    // Step 4: Filter assets based on user selection if specified
    const filteredBySelectionAssets = data.selectedAssets && Object.keys(data.selectedAssets).length > 0
      ? scoredAssets.filter(asset => {
          const platformAssets = data.selectedAssets?.[asset.platform_id];
          return platformAssets?.includes(asset.id);
        })
      : scoredAssets;

    // Handle edge case where there are no assets after filtering
    if (filteredBySelectionAssets.length === 0) {
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 5: Budget Allocation
    const totalTargetingScore = filteredBySelectionAssets.reduce(
      (sum, asset) => sum + (asset.targeting_score || 1), 
      0
    );
    
    // Allocate budget proportionally based on targeting score
    const assetsWithBudget = filteredBySelectionAssets.map(asset => {
      const proportion = (asset.targeting_score || 1) / totalTargetingScore;
      const allocatedBudget = Math.min(
        (data.budget || 0) * proportion,
        (asset.cost_per_day || 0) * campaignDays
      );
      
      return {
        ...asset,
        allocated_budget: allocatedBudget
      };
    });

    // Step 6: Final Asset Selection
    // Group assets by platform
    const processedPlatforms: PlatformWithAssets[] = [];
    let calculatedTotalCost = 0;
    let calculatedTotalImpressions = 0;

    platformsData.forEach(platform => {
      const platformAssets = assetsWithBudget.filter(
        asset => asset.platform_id === platform.id
      );
      
      const platformTotalCost = platformAssets.reduce((sum, asset) => {
        // Use the asset's calculated cost based on campaign days
        return sum + (asset.cost_per_day || 0) * campaignDays;
      }, 0);

      const platformTotalImpressions = platformAssets.reduce((sum, asset) => {
        return sum + (asset.estimated_impressions || 0) * campaignDays;
      }, 0);

      calculatedTotalCost += platformTotalCost;
      calculatedTotalImpressions += platformTotalImpressions;

      if (platformAssets.length > 0) {
        // Convert the database platform to our Platform interface
        const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
        
        processedPlatforms.push({
          ...enhancedPlatform,
          assets: platformAssets,
          totalCost: platformTotalCost,
          totalImpressions: platformTotalImpressions,
          selectedAssets: data.selectedAssets?.[platform.id] || []
        });
      }
    });

    return {
      platforms: processedPlatforms,
      totalCost: calculatedTotalCost,
      totalImpressions: calculatedTotalImpressions,
      campaignDays
    };
  } catch (error) {
    console.error("Error generating campaign quotation:", error);
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays 
    };
  }
};
