
import { supabase } from "@/integrations/supabase/client";
import { enhanceAsset } from "@/utils/campaignUtils";
import { Asset, AssetWithScoring, CampaignData, PlatformDbRecord } from "./types";
import { parseAudienceData } from "@/utils/campaignUtils";

/**
 * Fetch assets for specified platforms
 */
export const fetchAssets = async (platformIds: string[]): Promise<Asset[]> => {
  // Validate input
  if (!platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
    console.log("No valid platform IDs provided for asset fetching");
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .in("platform_id", platformIds);

    if (error) {
      console.error("Supabase error fetching assets:", error);
      throw error;
    }
    
    // Validate data is an array
    if (!data || !Array.isArray(data)) {
      console.log("No asset data returned from Supabase or invalid data format");
      return [];
    }
    
    // Use enhanceAsset with validation
    return data.map(asset => asset ? enhanceAsset(asset) : null).filter(Boolean) as Asset[];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
};

/**
 * Filter assets by categories if specified
 */
export const filterAssetsByCategory = (
  assets: Asset[], 
  assetCategories: string[]
): Asset[] => {
  // Validate assets is an array
  if (!assets || !Array.isArray(assets)) {
    console.log("No valid assets provided to filterAssetsByCategory");
    return [];
  }
  
  // If no categories, return all assets
  if (!assetCategories || !Array.isArray(assetCategories) || assetCategories.length === 0) {
    return assets;
  }
  
  // Filter with validation
  return assets.filter(asset => 
    asset && 
    typeof asset === 'object' && 
    asset.category && 
    assetCategories.includes(asset.category)
  );
};

/**
 * Process assets to add required properties
 */
export const processAssets = (assets: Asset[]): Asset[] => {
  // Validate assets is an array
  if (!assets || !Array.isArray(assets)) {
    console.log("No valid assets provided to processAssets");
    return [];
  }
  
  // Process with validation
  return assets.map((asset) => {
    if (!asset || typeof asset !== 'object') return null;
    
    // Generate default values for missing properties
    const costPerDay = typeof asset.cost_per_day === 'number' ? asset.cost_per_day : Math.floor(Math.random() * 15000) + 5000;
    const estimatedImpressions = typeof asset.estimated_impressions === 'number' ? asset.estimated_impressions : Math.floor(Math.random() * 90000) + 10000;
    
    return {
      ...asset,
      cost_per_day: costPerDay,
      estimated_impressions: estimatedImpressions,
      targeting_score: typeof asset.targeting_score === 'number' ? asset.targeting_score : 1.0,
      status: asset.status || "active",
      allocated_budget: typeof asset.allocated_budget === 'number' ? asset.allocated_budget : 0
    };
  }).filter(Boolean) as Asset[];
};

/**
 * Calculate targeting score for each asset based on campaign data
 */
export const scoreAssets = (
  assets: Asset[], 
  platformsData: PlatformDbRecord[], 
  campaignData: CampaignData
): AssetWithScoring[] => {
  // Validate inputs
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    console.log("No valid assets provided for scoring");
    return [];
  }
  
  if (!platformsData || !Array.isArray(platformsData)) {
    console.log("No valid platform data provided for scoring");
    return assets as AssetWithScoring[];
  }
  
  if (!campaignData || typeof campaignData !== 'object') {
    console.log("No valid campaign data provided for scoring");
    return assets as AssetWithScoring[];
  }

  // Score assets with validation
  return assets.map(asset => {
    if (!asset || typeof asset !== 'object') return null;
    
    // Start with a base score
    let score = 1.0;

    // Get the associated platform for the asset
    const platform = platformsData.find(p => p && p.id === asset.platform_id);
    
    // If we have audience data for the platform, use it for scoring
    if (platform && platform.audience_data) {
      // Process audience data to ensure correct type
      const audienceData = parseAudienceData(platform.audience_data);
      
      if (audienceData && typeof audienceData === 'object') {
        // Check demographic matches (age groups)
        const campaignAgeGroups = campaignData.demographics?.ageGroups;
        const audienceAgeGroups = audienceData.demographic?.ageGroups;
        
        if (campaignAgeGroups && Array.isArray(campaignAgeGroups) && campaignAgeGroups.length > 0 &&
            audienceAgeGroups && Array.isArray(audienceAgeGroups) && audienceAgeGroups.length > 0) {
          const ageGroupMatch = campaignAgeGroups.some(age => audienceAgeGroups.includes(age));
          if (ageGroupMatch) score += 0.2;
        }
        
        // Check gender matches
        const campaignGenders = campaignData.demographics?.gender;
        const audienceGenders = audienceData.demographic?.gender;
        
        if (campaignGenders && Array.isArray(campaignGenders) && campaignGenders.length > 0 &&
            audienceGenders && Array.isArray(audienceGenders) && audienceGenders.length > 0) {
          const genderMatch = campaignGenders.some(gender => audienceGenders.includes(gender));
          if (genderMatch) score += 0.2;
        }
        
        // Check interest matches
        const campaignInterests = campaignData.demographics?.interests;
        const audienceInterests = audienceData.demographic?.interests;
        
        if (campaignInterests && Array.isArray(campaignInterests) && campaignInterests.length > 0 &&
            audienceInterests && Array.isArray(audienceInterests) && audienceInterests.length > 0) {
          const interestMatch = campaignInterests.some(interest => audienceInterests.includes(interest));
          if (interestMatch) score += 0.2;
        }
        
        // Check geographic matches (cities)
        const campaignCities = campaignData.geographics?.cities;
        const audienceCities = audienceData.geographic?.cities;
        
        if (campaignCities && Array.isArray(campaignCities) && campaignCities.length > 0 &&
            audienceCities && Array.isArray(audienceCities) && audienceCities.length > 0) {
          const cityMatch = campaignCities.some(city => audienceCities.includes(city));
          if (cityMatch) score += 0.2;
        }
        
        // Check geographic matches (states)
        const campaignStates = campaignData.geographics?.states;
        const audienceStates = audienceData.geographic?.states;
        
        if (campaignStates && Array.isArray(campaignStates) && campaignStates.length > 0 &&
            audienceStates && Array.isArray(audienceStates) && audienceStates.length > 0) {
          const stateMatch = campaignStates.some(state => audienceStates.includes(state));
          if (stateMatch) score += 0.2;
        }
      }
    }
    
    return {
      ...asset,
      targeting_score: score
    };
  }).filter(Boolean) as AssetWithScoring[];
};

/**
 * Filter assets based on user selection
 */
export const filterAssetsBySelection = (
  assets: AssetWithScoring[], 
  selectedAssets: { [platformId: string]: string[] } | undefined
): AssetWithScoring[] => {
  // Validate assets is an array
  if (!assets || !Array.isArray(assets)) {
    console.log("No valid assets provided to filterAssetsBySelection");
    return [];
  }
  
  // If no selection, return all assets
  if (!selectedAssets || typeof selectedAssets !== 'object' || Object.keys(selectedAssets).length === 0) {
    return assets;
  }
  
  // Filter with validation
  return assets.filter(asset => {
    if (!asset || !asset.platform_id) return false;
    
    const platformAssets = selectedAssets[asset.platform_id];
    if (!platformAssets || !Array.isArray(platformAssets) || platformAssets.length === 0) return false;
    
    return platformAssets.includes(asset.id);
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
  // Validate inputs
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    console.log("No valid assets provided for budget allocation");
    return [];
  }
  
  // Validate budget and campaign days
  const validBudget = typeof budget === 'number' && budget > 0 ? budget : 0;
  const validCampaignDays = typeof campaignDays === 'number' && campaignDays > 0 ? campaignDays : 1;
  
  // Calculate total targeting score with validation
  const totalTargetingScore = assets.reduce(
    (sum, asset) => {
      const score = asset && typeof asset.targeting_score === 'number' ? asset.targeting_score : 0;
      return sum + score;
    }, 
    0
  );
  
  // If no score, return unmodified assets
  if (totalTargetingScore <= 0) {
    console.log("Total targeting score is zero or invalid");
    return assets;
  }
  
  // Allocate budget with validation
  return assets.map(asset => {
    if (!asset || typeof asset !== 'object') return null;
    
    const score = typeof asset.targeting_score === 'number' ? asset.targeting_score : 0;
    const proportion = score / totalTargetingScore;
    const costPerDay = typeof asset.cost_per_day === 'number' ? asset.cost_per_day : 0;
    
    const allocatedBudget = Math.min(
      validBudget * proportion,
      costPerDay * validCampaignDays
    );
    
    return {
      ...asset,
      allocated_budget: allocatedBudget
    };
  }).filter(Boolean) as AssetWithScoring[];
};
