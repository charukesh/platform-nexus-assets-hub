
import { supabase } from "@/integrations/supabase/client";
import { 
  enhanceAsset, 
  enhancePlatform 
} from "@/utils/campaignUtils";
import { 
  Asset, 
  PlatformDbRecord, 
  PlatformWithAssets 
} from "@/types/campaign";

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

    // Create assets with required fields
    const assets: Asset[] = (assetsData || []).map(enhanceAsset);

    // Calculate costs and impressions
    const totalCost = assets.reduce((sum, asset) => sum + asset.cost_per_day, 0);
    const totalImpressions = assets.reduce((sum, asset) => sum + asset.estimated_impressions, 0);

    // Create platform with all required fields
    const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
    
    return {
      ...enhancedPlatform,
      assets,
      totalCost,
      totalImpressions
    };
  } catch (error) {
    console.error('Error fetching platform with assets:', error);
    throw error;
  }
};
