
import { FormDataType } from "@/utils/platformFormUtils";

export const usePlatformFormHandlers = (
  formData: FormDataType,
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>
) => {
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

  return {
    handleChange,
    handleNestedChange,
    handleDemographicChange,
    handleGeographicChange,
    handleAudienceSupportsChange,
    handleCampaignChange,
    handleRestrictionsChange
  };
};
