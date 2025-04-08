
import { supabase } from "@/integrations/supabase/client";
import { enhancePlatform, enhanceAsset } from "@/utils/campaignUtils";
import { 
  Asset, 
  PlatformDbRecord, 
  PlatformWithAssets 
} from "./types";

/**
 * Fetch platform data by ID with its associated assets
 */
export const getPlatformWithAssets = async (id: string): Promise<PlatformWithAssets | null> => {
  try {
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', id)
      .single();

    if (platformError) {
      throw platformError;
    }

    if (!platform) {
      return null;
    }

    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('platform_id', id);

    if (assetsError) {
      throw assetsError;
    }

    // Use enhanceAsset to ensure all required fields are present
    const assets = (assetsData || []).map(asset => enhanceAsset(asset));
    
    // Calculate costs and impressions
    const totalCost = assets.reduce((sum, asset) => {
      return sum + (asset.cost_per_day || 0);
    }, 0);
    
    const totalImpressions = assets.reduce((sum, asset) => {
      return sum + (asset.estimated_impressions || 0);
    }, 0);

    // Create platform with all required fields
    const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
    
    return {
      ...enhancedPlatform,
      assets: assets as Asset[],
      totalCost,
      totalImpressions
    };
  } catch (error) {
    console.error('Error fetching platform with assets:', error);
    throw error;
  }
};

/**
 * Fetch platforms by their IDs
 */
export const fetchPlatformsByIds = async (platformIds: string[]): Promise<PlatformDbRecord[]> => {
  if (!platformIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .in("id", platformIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching platforms:", error);
    throw error;
  }
};
