
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { CampaignSection } from '@/components/platform/CampaignSection';
import { TargetingSection } from '@/components/platform/TargetingSection';
import BasicInfoSection from '@/components/platform/BasicInfoSection';
import PerformanceMetricsSection from '@/components/platform/PerformanceMetricsSection';
import CommentsSection from '@/components/platform/CommentsSection';
import FormActions from '@/components/platform/FormActions';
import { usePlatformForm } from '@/hooks/usePlatformForm';
import { toast } from '@/hooks/use-toast';

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
    handleSubmit,
    isSubmitting
  } = usePlatformForm({ platformData, id });

  if (isLoading) return (
    <Layout>
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Platform name is required", variant: "destructive" });
      return;
    }
    
    if (!formData.industry) {
      toast({ title: "Error", description: "Industry is required", variant: "destructive" });
      return;
    }
    
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

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

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <BasicInfoSection 
            formData={formData} 
            handleChange={handleChange} 
            platformId={id}
          />

          <PerformanceMetricsSection 
            formData={formData}
            handleChange={handleChange}
            handleDeviceSplitChange={handleDeviceSplitChange}
          />

          <TargetingSection
            audienceData={formData.audience_data}
            onAudienceDataChange={handleAudienceDataChange}
          />

          <CampaignSection
            campaignData={formData.campaign_data}
            onCampaignDataChange={handleCampaignDataChange}
          />

          <CommentsSection 
            comments={formData.comments}
            onChange={(value) => handleChange('comments', value)}
          />

          <FormActions 
            isEditing={!!id} 
            onCancel={() => navigate('/platforms')} 
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
