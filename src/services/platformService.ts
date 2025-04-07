
import { supabase } from "@/integrations/supabase/client";
import { 
  enhanceAsset, 
  enhancePlatform 
} from "@/utils/campaignUtils";
import { 
  Asset, 
  PlatformDbRecord, 
  PlatformWithAssets,
  FormDataType
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

// Add the missing functions for usePlatformForm.ts
export const fetchPlatformById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching platform:", error);
    throw error;
  }
};

export const savePlatform = async (formData: FormDataType, id?: string) => {
  try {
    // Determine if we're creating a new platform or updating an existing one
    if (id) {
      // Update existing platform
      const { data, error } = await supabase
        .from('platforms')
        .update({
          name: formData.name,
          industry: formData.industry,
          mau: formData.mau,
          dau: formData.dau,
          premium_users: formData.premium_users,
          device_split: formData.device_split,
          audience_data: formData.audience_data,
          campaign_data: formData.campaign_data,
          restrictions: formData.restrictions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      return { data, error };
    } else {
      // Create new platform
      const { data, error } = await supabase
        .from('platforms')
        .insert({
          name: formData.name,
          industry: formData.industry,
          mau: formData.mau,
          dau: formData.dau,
          premium_users: formData.premium_users,
          device_split: formData.device_split,
          audience_data: formData.audience_data,
          campaign_data: formData.campaign_data,
          restrictions: formData.restrictions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      return { data, error };
    }
  } catch (error) {
    console.error("Error saving platform:", error);
    throw error;
  }
};
