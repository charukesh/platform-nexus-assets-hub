
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/utils/platformFormUtils";

export const fetchPlatformById = async (id: string) => {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const savePlatform = async (platformData: FormDataType, id?: string) => {
  const dataToSave = {
    name: platformData.name,
    industry: platformData.industry,
    mau: platformData.mau,
    dau: platformData.dau,
    premium_users: platformData.premium_users,
    premium_users_display_as_percentage: platformData.premium_users_display_as_percentage,
    device_split: platformData.device_split,
    audience_data: platformData.audience_data,
    campaign_data: platformData.campaign_data,
    restrictions: platformData.restrictions
  };
  
  if (id) {
    // Update existing platform
    return await supabase
      .from('platforms')
      .update(dataToSave)
      .eq('id', id);
  } else {
    // Create new platform
    return await supabase
      .from('platforms')
      .insert(dataToSave);
  }
};
