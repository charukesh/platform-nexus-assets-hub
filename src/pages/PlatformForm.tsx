import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultiStepForm from "@/components/MultiStepForm";
import { 
  FormDataType, 
  defaultFormData, 
  parseJsonField 
} from "@/utils/platformFormUtils";
import { BasicInfoStep } from "@/components/platform-form/BasicInfoStep";
import { AudienceTargetingStep } from "@/components/platform-form/AudienceTargetingStep";
import { CampaignCapabilitiesStep } from "@/components/platform-form/CampaignCapabilitiesStep";
import { RestrictionsStep } from "@/components/platform-form/RestrictionsStep";

const PlatformForm: React.FC = () => {
  const navigate = useNavigate();
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
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        const audienceData = parseJsonField(data.audience_data, defaultFormData.audience_data);
        if (!audienceData.supports) {
          audienceData.supports = defaultFormData.audience_data.supports;
        }
        
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          mau: data.mau || "",
          dau: data.dau || "",
          premium_users: data.premium_users || 0,
          premium_users_display_as_percentage: data.premium_users_display_as_percentage !== undefined 
            ? data.premium_users_display_as_percentage 
            : true,
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof FormDataType, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as object,
        [field]: value
      }
    }));
  };

  const handleDemographicChange = (field: keyof FormDataType['audience_data']['demographic'], value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        demographic: {
          ...prev.audience_data.demographic,
          [field]: value
        }
      }
    }));
  };

  const handleGeographicChange = (field: keyof FormDataType['audience_data']['geographic'], value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        geographic: {
          ...prev.audience_data.geographic,
          [field]: value
        }
      }
    }));
  };

  const handleAudienceSupportsChange = (field: keyof FormDataType['audience_data']['supports'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        supports: {
          ...prev.audience_data.supports,
          [field]: value
        }
      }
    }));
  };

  const handleCampaignChange = (field: keyof FormDataType['campaign_data'], value: any) => {
    setFormData(prev => ({
      ...prev,
      campaign_data: {
        ...prev.campaign_data,
        [field]: value
      }
    }));
  };

  const handleRestrictionsChange = (field: keyof FormDataType['restrictions'], value: any) => {
    setFormData(prev => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        [field]: value
      }
    }));
  };

  const handleArrayItemAdd = (category: string, subcategory: string, value: string) => {
    if (!value.trim()) return;
    
    if (category === 'audience_data') {
      if (subcategory === 'geographic') {
        let field: string;
        let currentValue: string;
        
        if (value === document.getElementById('cities')?.getAttribute('value')) {
          field = 'cities';
          currentValue = value;
        } else if (value === document.getElementById('states')?.getAttribute('value')) {
          field = 'states';
          currentValue = value;
        } else if (value === document.getElementById('pincodes')?.getAttribute('value')) {
          field = 'pincodes';
          currentValue = value;
        } else {
          field = 'regions';
          currentValue = value;
        }
        
        const currentArray = formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[];
        
        if (!currentArray.includes(currentValue)) {
          handleGeographicChange(field as keyof FormDataType['audience_data']['geographic'], [...currentArray, currentValue]);
        }
      }
    }
  };

  const handleArrayItemRemove = (category: string, subcategory: string, field: string, index: number) => {
    if (category === 'audience_data') {
      if (subcategory === 'demographic') {
        const newArray = [...formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[]];
        newArray.splice(index, 1);
        handleDemographicChange(field as keyof FormDataType['audience_data']['demographic'], newArray);
      } else if (subcategory === 'geographic') {
        const newArray = [...formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[]];
        newArray.splice(index, 1);
        handleGeographicChange(field as keyof FormDataType['audience_data']['geographic'], newArray);
      }
    } else if (category === 'campaign_data') {
      const newArray = [...formData.campaign_data[field as keyof typeof formData.campaign_data] as string[]];
      newArray.splice(index, 1);
      handleCampaignChange(field as keyof FormDataType['campaign_data'], newArray);
    } else if (category === 'restrictions') {
      const newArray = [...formData.restrictions[field as keyof typeof formData.restrictions] as string[]];
      newArray.splice(index, 1);
      handleRestrictionsChange(field as keyof FormDataType['restrictions'], newArray);
    }
  };

  const handleCheckboxToggle = (category: string, field: string, value: string) => {
    if (category === 'audience_data.demographic') {
      const currentArray = formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleDemographicChange(field as keyof FormDataType['audience_data']['demographic'], newArray);
    } else if (category === 'campaign_data') {
      const currentArray = formData.campaign_data[field as keyof typeof formData.campaign_data] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleCampaignChange(field as keyof FormDataType['campaign_data'], newArray);
    } else if (category === 'restrictions') {
      const currentArray = formData.restrictions[field as keyof typeof formData.restrictions] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleRestrictionsChange(field as keyof FormDataType['restrictions'], newArray);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const platformData = {
        name: formData.name,
        industry: formData.industry,
        mau: formData.mau,
        dau: formData.dau,
        premium_users: formData.premium_users,
        premium_users_display_as_percentage: formData.premium_users_display_as_percentage,
        device_split: formData.device_split,
        audience_data: formData.audience_data,
        campaign_data: formData.campaign_data,
        restrictions: formData.restrictions
      };
      
      let result;
      
      if (isEditMode) {
        result = await supabase
          .from('platforms')
          .update(platformData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('platforms')
          .insert(platformData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: isEditMode ? "Platform updated" : "Platform created",
        description: isEditMode 
          ? "Platform has been successfully updated." 
          : "Platform has been successfully created.",
      });
      
      navigate("/platforms");
    } catch (error: any) {
      toast({
        title: "Error saving platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateBasicInfo = () => {
    if (!formData.name || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const formSteps = [
    {
      title: "Basic Information",
      validator: validateBasicInfo,
      content: (
        <BasicInfoStep 
          formData={formData}
          handleChange={handleChange}
          handleNestedChange={handleNestedChange}
        />
      )
    },
    {
      title: "Audience Targeting",
      content: (
        <AudienceTargetingStep 
          formData={formData}
          handleAudienceSupportsChange={handleAudienceSupportsChange}
          handleDemographicChange={handleDemographicChange}
          handleGeographicChange={handleGeographicChange}
          handleArrayItemAdd={handleArrayItemAdd}
          handleArrayItemRemove={handleArrayItemRemove}
        />
      )
    },
    {
      title: "Campaign Capabilities",
      content: (
        <CampaignCapabilitiesStep 
          formData={formData}
          handleCheckboxToggle={handleCheckboxToggle}
          handleCampaignChange={handleCampaignChange}
        />
      )
    },
    {
      title: "Restrictions & Notes",
      content: (
        <RestrictionsStep 
          formData={formData}
          handleCheckboxToggle={handleCheckboxToggle}
          handleRestrictionsChange={handleRestrictionsChange}
        />
      )
    }
  ];

  return (
    <Layout>
      <div className="container py-8">
        <NeuCard className="max-w-4xl mx-auto p-6 border-t-4 border-primary">
          <h1 className="text-2xl font-bold mb-6">
            {isEditMode ? "Edit Platform" : "Add New Platform"}
          </h1>
          
          {fetchLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading platform data...</p>
            </div>
          ) : (
            <MultiStepForm
              steps={formSteps}
              onComplete={handleSubmit}
              onCancel={() => navigate("/platforms")}
              isSubmitting={loading}
            />
          )}
        </NeuCard>
      </div>
    </Layout>
  );
};

export default PlatformForm;
