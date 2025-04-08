
import { supabase } from "@/integrations/supabase/client";
import { enhanceAsset } from "@/utils/campaignUtils";
import { Asset, AssetWithScoring, CampaignData, PlatformDbRecord } from "./types";
import { parseAudienceData } from "@/utils/campaignUtils";

/**
 * Fetch assets for specified platforms
 */
export const fetchAssets = async (platformIds: string[]): Promise<Asset[]> => {
  if (!platformIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .in("platform_id", platformIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

/**
 * Filter assets by categories if specified
 */
export const filterAssetsByCategory = (
  assets: Asset[], 
  assetCategories: string[]
): Asset[] => {
  if (!assetCategories.length) return assets;
  return assets.filter(asset => assetCategories.includes(asset.category || ''));
};

/**
 * Process assets to add required properties
 */
export const processAssets = (assets: Asset[]): Asset[] => {
  return assets.map((asset) => {
    // Generate default values for missing properties
    const costPerDay = Math.floor(Math.random() * 15000) + 5000;
    const estimatedImpressions = Math.floor(Math.random() * 90000) + 10000;
    
    // Use enhanceAsset to transform the database asset to our Asset interface
    return enhanceAsset({
      ...asset,
      // Add these properties to the object before passing to enhanceAsset
      cost_per_day: costPerDay,
      estimated_impressions: estimatedImpressions,
      targeting_score: 1.0,
      status: "active",
      allocated_budget: 0,
      dimensions: null,
      restrictions: null
    });
  });
};

/**
 * Calculate targeting score for each asset based on campaign data
 */
export const scoreAssets = (
  assets: Asset[], 
  platformsData: PlatformDbRecord[], 
  campaignData: CampaignData
): AssetWithScoring[] => {
  return assets.map(asset => {
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
            campaignData.demographics?.ageGroups?.length > 0) {
          const ageGroupMatch = campaignData.demographics.ageGroups.some(
            age => audienceData.demographic?.ageGroups?.includes(age)
          );
          if (ageGroupMatch) score += 0.2;
        }
        
        // Check gender matches
        if (audienceData.demographic?.gender && 
            campaignData.demographics?.gender?.length > 0) {
          const genderMatch = campaignData.demographics.gender.some(
            gender => audienceData.demographic?.gender?.includes(gender)
          );
          if (genderMatch) score += 0.2;
        }
        
        // Check interest matches
        if (audienceData.demographic?.interests && 
            campaignData.demographics?.interests?.length > 0) {
          const interestMatch = campaignData.demographics.interests.some(
            interest => audienceData.demographic?.interests?.includes(interest)
          );
          if (interestMatch) score += 0.2;
        }
        
        // Check geographic matches (cities)
        if (audienceData.geographic?.cities && 
            campaignData.geographics?.cities?.length > 0) {
          const cityMatch = campaignData.geographics.cities.some(
            city => audienceData.geographic?.cities?.includes(city)
          );
          if (cityMatch) score += 0.2;
        }
        
        // Check geographic matches (states)
        if (audienceData.geographic?.states && 
            campaignData.geographics?.states?.length > 0) {
          const stateMatch = campaignData.geographics.states.some(
            state => audienceData.geographic?.states?.includes(state)
          );
          if (stateMatch) score += 0.2;
        }
      }
    }
    
    return {
      ...asset,
      targeting_score: score
    };
  });
};

/**
 * Filter assets based on user selection
 */
export const filterAssetsBySelection = (
  assets: AssetWithScoring[], 
  selectedAssets: { [platformId: string]: string[] } | undefined
): AssetWithScoring[] => {
  if (!selectedAssets || Object.keys(selectedAssets).length === 0) {
    return assets;
  }
  
  return assets.filter(asset => {
    const platformAssets = selectedAssets[asset.platform_id];
    return platformAssets?.includes(asset.id);
  });
};

/**
 * Allocate budget to assets based on targeting score
 */
export const allocateBudget = (
  assets: AssetWithScoring[],
  budget: number,
  campaignDays: number
): AssetWithScoring[] => {
  const totalTargetingScore = assets.reduce(
    (sum, asset) => sum + (asset.targeting_score || 1), 
    0
  );
  
  return assets.map(asset => {
    const proportion = (asset.targeting_score || 1) / totalTargetingScore;
    const allocatedBudget = Math.min(
      (budget || 0) * proportion,
      (asset.cost_per_day || 0) * campaignDays
    );
    
    return {
      ...asset,
      allocated_budget: allocatedBudget
    };
  });
};
