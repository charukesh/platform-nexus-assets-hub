import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import NeuCard from '@/components/NeuCard';
import NeuButton from '@/components/NeuButton';
import NeuInput from '@/components/NeuInput';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { CampaignSection } from '@/components/platform/CampaignSection';
import { TargetingSection } from '@/components/platform/TargetingSection';
import type { PlatformFormData, Json } from '@/types/platform';
import { Tables } from '@/integrations/supabase/types';
import { INDUSTRY_OPTIONS } from '@/types/platform';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LogoUpload from "@/components/platform/LogoUpload";

const PlatformForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<PlatformFormData>({
    name: '',
    industry: '',
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

  const { data: platformData, isLoading } = useQuery({
    queryKey: ['platform', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tables<'platforms'>;
    },
    enabled: !!id,
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const supabaseData = {
        name: formData.name,
        industry: formData.industry,
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
        result = await supabase
          .from('platforms')
          .update(supabaseData)
          .eq('id', id)
          .select()
          .single();
      } else {
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

  if (isLoading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/platforms" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Platforms
            </Link>
            <h1 className="text-3xl font-bold mt-2">{id ? 'Edit Platform' : 'New Platform'}</h1>
            <p className="text-muted-foreground mt-1">Create and manage your platform details</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <LogoUpload
                currentLogoUrl={formData.logo_url}
                onUpload={(url) => handleChange('logo_url', url)}
                platformId={id || 'new'}
              />
              
              <div>
                <Label htmlFor="name">Platform Name*</Label>
                <NeuInput
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry*</Label>
                <Select 
                  value={formData.industry}
                  onValueChange={(value) => handleChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category Blocks</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {INDUSTRY_OPTIONS.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.audience_data.platform_specific_targeting?.includes(category)}
                        onCheckedChange={(checked) => {
                          const current = formData.audience_data.platform_specific_targeting || [];
                          const updated = checked
                            ? [...current, category]
                            : current.filter(c => c !== category);
                          handleAudienceDataChange('platform_specific_targeting', updated);
                        }}
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="premium_users">Premium Users (%)</Label>
                <NeuInput
                  id="premium_users"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.premium_users || ''}
                  onChange={(e) => handleChange('premium_users', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              <div>
                <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
                <NeuInput
                  id="mau"
                  type="text"
                  value={formData.mau}
                  onChange={(e) => handleChange('mau', e.target.value)}
                  placeholder="e.g., 22,000,000"
                />
              </div>

              <div>
                <Label htmlFor="dau">Daily Active Users (DAU)</Label>
                <NeuInput
                  id="dau"
                  type="text"
                  value={formData.dau}
                  onChange={(e) => handleChange('dau', e.target.value)}
                  placeholder="e.g., 10,000,000"
                />
              </div>
            </div>
          </NeuCard>

          <TargetingSection
            audienceData={formData.audience_data}
            onAudienceDataChange={handleAudienceDataChange}
          />

          <CampaignSection
            campaignData={formData.campaign_data}
            onCampaignDataChange={handleCampaignDataChange}
          />

          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Device Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ios">iOS (%)</Label>
                <NeuInput
                  id="ios"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.ios}
                  onChange={(e) => handleChange('device_split', {
                    ...formData.device_split,
                    ios: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="android">Android (%)</Label>
                <NeuInput
                  id="android"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.android}
                  onChange={(e) => handleChange('device_split', {
                    ...formData.device_split,
                    android: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="web">Web (%)</Label>
                <NeuInput
                  id="web"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.device_split.web || 0}
                  onChange={(e) => handleChange('device_split', {
                    ...formData.device_split,
                    web: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </NeuCard>

          <div className="flex justify-end gap-3">
            <NeuButton
              type="button"
              variant="outline"
              onClick={() => navigate("/platforms")}
            >
              Cancel
            </NeuButton>
            <NeuButton type="submit">
              {id ? "Update Platform" : "Create Platform"}
            </NeuButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
