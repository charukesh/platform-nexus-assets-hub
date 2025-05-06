
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import NeuCard from '@/components/NeuCard';
import { ArrowLeft } from 'lucide-react';
import { CampaignSection } from '@/components/platform/CampaignSection';
import { TargetingSection } from '@/components/platform/TargetingSection';
import BasicInfoSection from '@/components/platform/BasicInfoSection';
import DeviceDistributionSection from '@/components/platform/DeviceDistributionSection';
import FormActions from '@/components/platform/FormActions';
import { usePlatformForm } from '@/hooks/usePlatformForm';

const PlatformForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      return data;
    },
    enabled: !!id,
  });

  const {
    formData,
    handleChange,
    handleAudienceDataChange,
    handleCampaignDataChange,
    handleDeviceSplitChange,
    handleSubmit
  } = usePlatformForm({ platformData, id });

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
          <BasicInfoSection 
            formData={formData} 
            handleChange={handleChange} 
            handleAudienceDataChange={handleAudienceDataChange}
            platformId={id}
          />

          <TargetingSection
            audienceData={formData.audience_data}
            onAudienceDataChange={handleAudienceDataChange}
          />

          <CampaignSection
            campaignData={formData.campaign_data}
            onCampaignDataChange={handleCampaignDataChange}
          />

          <DeviceDistributionSection 
            deviceSplit={formData.device_split}
            onDeviceSplitChange={handleDeviceSplitChange}
          />

          <FormActions isEditing={!!id} onCancel={() => navigate('/platforms')} />
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
