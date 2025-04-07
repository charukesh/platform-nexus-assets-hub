
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

export const savePlatform = async (platformData: any, id?: string) => {
  if (id) {
    // Update existing platform
    return await supabase
      .from('platforms')
      .update(platformData)
      .eq('id', id);
  } else {
    // Create new platform
    return await supabase
      .from('platforms')
      .insert(platformData);
  }
};
