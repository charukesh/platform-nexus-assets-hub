
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchPlatformById } from "@/services/platformService";
import { 
  FormDataType, 
  defaultFormData, 
  parseJsonField 
} from "@/utils/platformFormUtils";

export const usePlatformFormState = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(defaultFormData);
  
  useEffect(() => {
    if (isEditMode) {
      fetchPlatform();
    }
  }, [id]);

  const fetchPlatform = async () => {
    if (!id) return;
    
    try {
      setFetchLoading(true);
      const data = await fetchPlatformById(id);
      
      if (data) {
        const audienceData = parseJsonField(data.audience_data, defaultFormData.audience_data);
        if (!audienceData.supports) {
          audienceData.supports = defaultFormData.audience_data.supports;
        }
        
        const displayAsPercentage = 'premium_users_display_as_percentage' in data 
          ? data.premium_users_display_as_percentage as boolean 
          : true;
        
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          mau: data.mau || "",
          dau: data.dau || "",
          premium_users: data.premium_users || 0,
          premium_users_display_as_percentage: displayAsPercentage,
          device_split: parseJsonField(data.device_split, defaultFormData.device_split),
          audience_data: audienceData,
          campaign_data: parseJsonField(data.campaign_data, defaultFormData.campaign_data),
          restrictions: parseJsonField(data.restrictions, defaultFormData.restrictions)
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  return {
    id,
    isEditMode,
    loading,
    setLoading,
    fetchLoading,
    formData,
    setFormData,
    toast
  };
};
