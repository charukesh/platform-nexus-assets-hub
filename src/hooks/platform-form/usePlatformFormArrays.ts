
import { FormDataType } from "@/utils/platformFormUtils";

export const usePlatformFormArrays = (
  formData: FormDataType,
  handleGeographicChange: (field: keyof FormDataType['audience_data']['geographic'], value: any) => void,
  handleDemographicChange: (field: keyof FormDataType['audience_data']['demographic'], value: any) => void,
  handleCampaignChange: (field: keyof FormDataType['campaign_data'], value: any) => void,
  handleRestrictionsChange: (field: keyof FormDataType['restrictions'], value: any) => void
) => {
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

  return {
    handleArrayItemAdd,
    handleArrayItemRemove,
    handleCheckboxToggle
  };
};
