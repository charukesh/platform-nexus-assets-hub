
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "@/pages/CampaignQuotation";
import { differenceInDays } from "date-fns";

// Define types for the algorithm
interface Asset {
  id: string;
  name: string;
  category: string;
  platform_id: string;
  type: string;
  file_url: string;
  thumbnail_url: string;
  description: string;
  tags: string[];
  file_size: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  
  // Extended properties for campaign calculation
  cost_per_day: number;
  estimated_impressions: number;
  targeting_score?: number;
  allocated_budget?: number;
}

interface Platform {
  id: string;
  name: string;
  industry: string;
  mau: string | number;
  dau: string | number;
  premium_users: number;
  premium_users_display_as_percentage?: boolean;
  device_split?: any;
  audience_data?: {
    demographic?: {
      ageGroups?: string[];
      gender?: string[];
      interests?: string[];
    };
    geographic?: {
      cities?: string[];
      states?: string[];
      tierLevels?: string[];
    };
  };
  campaign_data?: any;
  restrictions?: any;
}

export interface PlatformWithAssets extends Platform {
  assets: Asset[];
  totalCost: number;
  totalImpressions: number;
}

// Algorithm implementation
export const generateCampaignQuotation = async (
  data: CampaignData
): Promise<{ 
  platforms: PlatformWithAssets[]; 
  totalCost: number; 
  totalImpressions: number;
  campaignDays: number;
}> => {
  // Determine campaign duration in days
  let campaignDays = 1;
  if (data.duration.startDate && data.duration.endDate) {
    const days = differenceInDays(data.duration.endDate, data.duration.startDate) + 1;
    campaignDays = days > 0 ? days : 1;
  }

  // Ensure there are selected platforms
  if (!data.platformPreferences.length) {
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays 
    };
  }

  // Step 1: Primary Filtering - Fetch platforms and assets
  const { data: platformsData, error: platformsError } = await supabase
    .from("platforms")
    .select("*")
    .in("id", data.platformPreferences);

  if (platformsError) throw platformsError;

  const { data: assetsData, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .in("platform_id", data.platformPreferences)
    .in("category", data.assetCategories);

  if (assetsError) throw assetsError;

  // Step 2: Objective-Based Filtering
  // For now, we assume all assets have the necessary metrics
  // In a real implementation, we would check for relevant metrics based on objectives
  
  // Apply cost and impressions to assets (simulated for now)
  const processedAssets = assetsData.map(asset => ({
    ...asset,
    cost_per_day: Math.floor(Math.random() * 15000) + 5000,
    estimated_impressions: Math.floor(Math.random() * 90000) + 10000
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
      const audienceData = platform.audience_data as {
        demographic?: {
          ageGroups?: string[];
          gender?: string[];
          interests?: string[];
        };
        geographic?: {
          cities?: string[];
          states?: string[];
          tierLevels?: string[];
        };
      };

      // Check demographic matches (age groups)
      if (audienceData.demographic?.ageGroups && 
          data.demographics.ageGroups.length > 0) {
        const ageGroupMatch = data.demographics.ageGroups.some(
          age => audienceData.demographic?.ageGroups?.includes(age)
        );
        if (ageGroupMatch) score += 0.2;
      }
      
      // Check gender matches
      if (audienceData.demographic?.gender && 
          data.demographics.gender.length > 0) {
        const genderMatch = data.demographics.gender.some(
          gender => audienceData.demographic?.gender?.includes(gender)
        );
        if (genderMatch) score += 0.2;
      }
      
      // Check interest matches
      if (audienceData.demographic?.interests && 
          data.demographics.interests.length > 0) {
        const interestMatch = data.demographics.interests.some(
          interest => audienceData.demographic?.interests?.includes(interest)
        );
        if (interestMatch) score += 0.2;
      }
      
      // Check geographic matches (cities)
      if (audienceData.geographic?.cities && 
          data.geographics.cities.length > 0) {
        const cityMatch = data.geographics.cities.some(
          city => audienceData.geographic?.cities?.includes(city)
        );
        if (cityMatch) score += 0.2;
      }
      
      // Check geographic matches (states)
      if (audienceData.geographic?.states && 
          data.geographics.states.length > 0) {
        const stateMatch = data.geographics.states.some(
          state => audienceData.geographic?.states?.includes(state)
        );
        if (stateMatch) score += 0.2;
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

  // Step 4: Budget Allocation
  const totalTargetingScore = scoredAssets.reduce(
    (sum, asset) => sum + (asset.targeting_score || 1), 
    0
  );
  
  // Allocate budget proportionally based on targeting score
  const assetsWithBudget = scoredAssets.map(asset => {
    const proportion = (asset.targeting_score || 1) / totalTargetingScore;
    const allocatedBudget = Math.min(
      data.budget * proportion,
      asset.cost_per_day * campaignDays
    );
    
    return {
      ...asset,
      allocated_budget: allocatedBudget
    };
  });

  // Step 5: Final Asset Selection
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
      return sum + asset.cost_per_day * campaignDays;
    }, 0);

    const platformTotalImpressions = platformAssets.reduce((sum, asset) => {
      return sum + asset.estimated_impressions * campaignDays;
    }, 0);

    calculatedTotalCost += platformTotalCost;
    calculatedTotalImpressions += platformTotalImpressions;

    if (platformAssets.length > 0) {
      processedPlatforms.push({
        ...platform,
        assets: platformAssets,
        totalCost: platformTotalCost,
        totalImpressions: platformTotalImpressions
      });
    }
  });

  return {
    platforms: processedPlatforms,
    totalCost: calculatedTotalCost,
    totalImpressions: calculatedTotalImpressions,
    campaignDays
  };
};
