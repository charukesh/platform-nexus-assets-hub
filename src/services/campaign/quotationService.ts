
import { enhancePlatform } from "@/utils/campaignUtils";
import { 
  Asset, 
  CampaignData, 
  PlatformDbRecord, 
  PlatformWithAssets,
  QuotationResult
} from "./types";
import { 
  fetchPlatformsByIds 
} from "./platformService";
import {
  fetchAssets,
  filterAssetsByCategory,
  processAssets,
  scoreAssets,
  filterAssetsBySelection,
  allocateBudget
} from "./assetUtils";

export * from "./platformService";

/**
 * Generate a campaign quotation based on campaign data
 */
export const generateCampaignQuotation = async (
  data: CampaignData
): Promise<QuotationResult> => {
  // Initial validation of campaign data
  if (!data || typeof data !== 'object') {
    console.error("Invalid campaign data provided:", data);
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays: 1 
    };
  }

  // Get campaign days with fallback
  const campaignDays = typeof data.durationDays === 'number' && data.durationDays > 0 
    ? data.durationDays 
    : 1;

  // Validate platform preferences
  const platformPreferences = data.platformPreferences || [];
  if (!Array.isArray(platformPreferences) || platformPreferences.length === 0) {
    console.log("No valid platform preferences found");
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays 
    };
  }

  try {
    // Step 1: Fetch platforms and validate the result
    const platformsData = await fetchPlatformsByIds(platformPreferences);
    
    if (!platformsData || !Array.isArray(platformsData) || platformsData.length === 0) {
      console.log("No platforms data returned from fetchPlatformsByIds");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 2: Fetch and process assets with validation
    const assets = await fetchAssets(platformPreferences);
    
    if (!assets || !Array.isArray(assets)) {
      console.log("No assets returned from fetchAssets");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }
    
    // Ensure assetCategories is an array
    const assetCategories = Array.isArray(data.assetCategories) ? data.assetCategories : [];
    
    // Filter assets by category with validation
    const filteredAssets = filterAssetsByCategory(assets, assetCategories);
    
    if (!filteredAssets || !Array.isArray(filteredAssets)) {
      console.log("No filtered assets returned from filterAssetsByCategory");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }
    
    // Process the assets with validation
    const processedAssets = processAssets(filteredAssets);
    
    if (!processedAssets || !Array.isArray(processedAssets) || processedAssets.length === 0) {
      console.log("No processed assets returned from processAssets");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 3: Score assets with validation
    const scoredAssets = scoreAssets(processedAssets, platformsData, data);
    
    if (!scoredAssets || !Array.isArray(scoredAssets) || scoredAssets.length === 0) {
      console.log("No scored assets returned from scoreAssets");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Sort assets by targeting score (descending) with null checks
    scoredAssets.sort((a, b) => {
      const scoreA = a && typeof a.targeting_score === 'number' ? a.targeting_score : 0;
      const scoreB = b && typeof b.targeting_score === 'number' ? b.targeting_score : 0;
      return scoreB - scoreA;
    });

    // Step 4: Filter assets based on user selection with validation
    const selectedAssets = data.selectedAssets && typeof data.selectedAssets === 'object' 
      ? data.selectedAssets 
      : {};
      
    const filteredBySelectionAssets = filterAssetsBySelection(scoredAssets, selectedAssets);
    
    if (!filteredBySelectionAssets || !Array.isArray(filteredBySelectionAssets) || filteredBySelectionAssets.length === 0) {
      console.log("No assets after filtering by selection");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 5: Budget Allocation with validation
    const budget = typeof data.budget === 'number' && data.budget > 0 ? data.budget : 0;
    
    const assetsWithBudget = allocateBudget(
      filteredBySelectionAssets, 
      budget,
      campaignDays
    );
    
    if (!assetsWithBudget || !Array.isArray(assetsWithBudget) || assetsWithBudget.length === 0) {
      console.log("No assets after budget allocation");
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 6: Final Asset Selection and grouping by platform
    const processedPlatforms: PlatformWithAssets[] = [];
    let calculatedTotalCost = 0;
    let calculatedTotalImpressions = 0;

    // Ensure platformsData is iterable
    if (Array.isArray(platformsData)) {
      platformsData.forEach(platform => {
        if (!platform || !platform.id) return;
        
        // Filter assets for this platform
        const platformAssets = Array.isArray(assetsWithBudget) 
          ? assetsWithBudget.filter(asset => asset && asset.platform_id === platform.id)
          : [];
        
        if (!platformAssets.length) return;
        
        // Calculate platform totals with validation
        const platformTotalCost = platformAssets.reduce((sum, asset) => {
          const costPerDay = asset && typeof asset.cost_per_day === 'number' ? asset.cost_per_day : 0;
          return sum + (costPerDay * campaignDays);
        }, 0);

        const platformTotalImpressions = platformAssets.reduce((sum, asset) => {
          const impressions = asset && typeof asset.estimated_impressions === 'number' ? asset.estimated_impressions : 0;
          return sum + (impressions * campaignDays);
        }, 0);

        calculatedTotalCost += platformTotalCost;
        calculatedTotalImpressions += platformTotalImpressions;

        // Convert platform and add to result
        const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
        
        // Get selected assets for this platform
        const platformSelectedAssets = data.selectedAssets && 
          typeof data.selectedAssets === 'object' && 
          platform.id && 
          data.selectedAssets[platform.id] &&
          Array.isArray(data.selectedAssets[platform.id])
            ? data.selectedAssets[platform.id] 
            : [];
        
        processedPlatforms.push({
          ...enhancedPlatform,
          assets: platformAssets,
          totalCost: platformTotalCost,
          totalImpressions: platformTotalImpressions,
          selectedAssets: platformSelectedAssets
        });
      });
    }

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
