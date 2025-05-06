
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformFormData, Json } from '@/types/platform';
import { Tables } from '@/integrations/supabase/types';

interface UsePlatformFormProps {
  platformData?: Tables<'platforms'> | null;
  id?: string;
}

export const usePlatformForm = ({ platformData, id }: UsePlatformFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PlatformFormData>({
    name: '',
    industry: '',
    description: '',  // Include description field
    mau: '',
    dau: '',
    premium_users: null,
    audience_data: {
      age_groups: {},
      gender: {},
      interests: [],
      age_targeting_available: false,
      gender_targeting_available: false,
      state_level_targeting: false,
      city_level_targeting: false,
      platform_specific_targeting: [],
    },
    device_split: {
      ios: 50,
      android: 50,
      web: 0,
    },
    campaign_data: {
      funnel_stage: [],
      buying_model: '',
      ad_formats: [],
      special_innovations: [],
      cta_support: false,
      minimum_spend: 0,
      geography_presence: '',
    },
    restrictions: {
      restricted_categories: [],
    },
    logo_url: '',
  });

  useEffect(() => {
    if (platformData) {
      const defaultAudienceData = {
        age_groups: {
          '13-17': 0,
          '18-24': 0,
          '25-34': 0,
          '35-44': 0,
          '45-54': 0,
          '55+': 0
        },
        gender: {
          male: 0,
          female: 0,
          other: 0
        },
        interests: [],
        age_targeting_available: false,
        gender_targeting_available: false,
        state_level_targeting: false,
        city_level_targeting: false,
        platform_specific_targeting: [],
      };

      const defaultDeviceSplit = {
        ios: 50,
        android: 50,
        web: 0
      };

      const defaultCampaignData = {
        funnel_stage: [],
        buying_model: '',
        ad_formats: [],
        special_innovations: [],
        cta_support: false,
        minimum_spend: 0,
        geography_presence: '',
      };

      const defaultRestrictions = {
        restricted_categories: [],
      };

      const audienceData = platformData.audience_data as Json;
      const deviceSplit = platformData.device_split as Json;
      const campaignData = platformData.campaign_data as Json;
      const restrictions = platformData.restrictions as Json;

      setFormData({
        name: platformData.name,
        industry: platformData.industry,
        description: platformData.description || '',  // Include description field
        audience_data: audienceData ?
          {
            age_groups: (audienceData as any)?.age_groups || defaultAudienceData.age_groups,
            gender: (audienceData as any)?.gender || defaultAudienceData.gender,
            interests: (audienceData as any)?.interests || defaultAudienceData.interests,
            age_targeting_available: (audienceData as any)?.age_targeting_available || defaultAudienceData.age_targeting_available,
            gender_targeting_available: (audienceData as any)?.gender_targeting_available || defaultAudienceData.gender_targeting_available,
            state_level_targeting: (audienceData as any)?.state_level_targeting || defaultAudienceData.state_level_targeting,
            city_level_targeting: (audienceData as any)?.city_level_targeting || defaultAudienceData.city_level_targeting,
            platform_specific_targeting: (audienceData as any)?.platform_specific_targeting || defaultAudienceData.platform_specific_targeting,
          } : defaultAudienceData,
        device_split: deviceSplit ?
          {
            ios: (deviceSplit as any)?.ios || defaultDeviceSplit.ios,
            android: (deviceSplit as any)?.android || defaultDeviceSplit.android,
            web: (deviceSplit as any)?.web || defaultDeviceSplit.web
          } : defaultDeviceSplit,
        campaign_data: campaignData ?
          {
            funnel_stage: (campaignData as any)?.funnel_stage || defaultCampaignData.funnel_stage,
            buying_model: (campaignData as any)?.buying_model || defaultCampaignData.buying_model,
            ad_formats: (campaignData as any)?.ad_formats || defaultCampaignData.ad_formats,
            special_innovations: (campaignData as any)?.special_innovations || defaultCampaignData.special_innovations,
            cta_support: (campaignData as any)?.cta_support || defaultCampaignData.cta_support,
            minimum_spend: (campaignData as any)?.minimum_spend || defaultCampaignData.minimum_spend,
            geography_presence: (campaignData as any)?.geography_presence || defaultCampaignData.geography_presence,
          } : defaultCampaignData,
        restrictions: restrictions ?
          {
            restricted_categories: (restrictions as any)?.restricted_categories || defaultRestrictions.restricted_categories,
          } : defaultRestrictions,
        mau: platformData.mau || '',
        dau: platformData.dau || '',
        premium_users: platformData.premium_users || null,
        logo_url: platformData.logo_url || '',
      });
    }
  }, [platformData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudienceDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        [field]: value
      }
    }));
  };

  const handleCampaignDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      campaign_data: {
        ...prev.campaign_data,
        [field]: value
      }
    }));
  };

  const handleDeviceSplitChange = (deviceSplit: any) => {
    setFormData(prev => ({
      ...prev,
      device_split: deviceSplit
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const supabaseData = {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,  // Include description field
        audience_data: formData.audience_data as unknown as Json,
        device_split: formData.device_split as unknown as Json,
        campaign_data: formData.campaign_data as unknown as Json,
        restrictions: formData.restrictions as unknown as Json,
        mau: formData.mau,
        dau: formData.dau,
        premium_users: formData.premium_users,
        logo_url: formData.logo_url,
      };
      
      let result;
      
      if (id) {
        // Update existing platform
        result = await supabase
          .from('platforms')
          .update(supabaseData)
          .eq('id', id)
          .select()
          .single();

        // If update was successful, fetch associated asset IDs only
        if (result.data && !result.error) {
          const { data: assetsData, error: assetsError } = await supabase
            .from('assets')
            .select('id')
            .eq('platform_id', id);

          if (assetsError) {
            console.error('Error fetching associated asset IDs:', assetsError);
          } else {
            console.log('Associated asset IDs:', assetsData);
            // If assets exist, trigger embeddings generation for each asset
            if (assetsData && assetsData.length > 0) {
              assetsData.forEach(asset => {
                // Fire and forget - no await
                supabase.functions.invoke('generate-embeddings', {
                  body: { id: asset.id }
                });
              });
              console.log(`Triggered embeddings generation for ${assetsData.length} assets`);
            }
          }
        }
      } else {
        // Create new platform
        result = await supabase
          .from('platforms')
          .insert([supabaseData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: id ? "Platform Updated" : "Platform Created",
        description: `Successfully ${id ? "updated" : "created"} ${formData.name}`,
      });

      navigate('/platforms');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    formData,
    handleChange,
    handleAudienceDataChange,
    handleCampaignDataChange,
    handleDeviceSplitChange,
    handleSubmit
  };
};
