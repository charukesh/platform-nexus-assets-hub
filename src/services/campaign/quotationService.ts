
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
    // Step 1: Fetch platforms and assets
    const platformsData = await fetchPlatformsByIds(data.platformPreferences);
    
    if (!platformsData || platformsData.length === 0) {
      return { 
        platforms: [], 
        totalCost: 0, 
        totalImpressions: 0,
        campaignDays 
      };
    }

    // Step 2: Fetch and process assets
    const assets = await fetchAssets(data.platformPreferences);
    
    // Make sure we have assetCategories to filter by
    const assetCategories = data.assetCategories || [];
    
    // Filter assets by category if categories are provided
    const filteredAssets = filterAssetsByCategory(assets, assetCategories);
    
    // Process the assets to add required properties
    const processedAssets = processAssets(filteredAssets);

    // Step 3: Targeting-Based Scoring
    const scoredAssets = scoreAssets(processedAssets, platformsData, data);

    // Sort assets by targeting score (descending)
    scoredAssets.sort((a, b) => 
      (b.targeting_score || 0) - (a.targeting_score || 0)
    );

    // Step 4: Filter assets based on user selection if specified
    const filteredBySelectionAssets = filterAssetsBySelection(scoredAssets, data.selectedAssets);

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
    const assetsWithBudget = allocateBudget(
      filteredBySelectionAssets, 
      data.budget || 0,
      campaignDays
    );

    // Step 6: Final Asset Selection and grouping by platform
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
