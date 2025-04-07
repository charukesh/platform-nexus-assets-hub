
import React from 'react';
import { FormDataType } from "@/utils/platformFormUtils";
import { BasicInfoStep } from "@/components/platform-form/BasicInfoStep";
import { AudienceTargetingStep } from "@/components/platform-form/AudienceTargetingStep";
import { CampaignCapabilitiesStep } from "@/components/platform-form/CampaignCapabilitiesStep";
import { RestrictionsStep } from "@/components/platform-form/RestrictionsStep";

interface FormStepsProps {
  formData: FormDataType;
  handleChange: (field: string, value: any) => void;
  handleNestedChange: (parent: keyof FormDataType, field: string, value: any) => void;
  handleDemographicChange: (field: keyof FormDataType['audience_data']['demographic'], value: any) => void;
  handleGeographicChange: (field: keyof FormDataType['audience_data']['geographic'], value: any) => void;
  handleAudienceSupportsChange: (field: keyof FormDataType['audience_data']['supports'], value: boolean) => void;
  handleCampaignChange: (field: keyof FormDataType['campaign_data'], value: any) => void;
  handleRestrictionsChange: (field: keyof FormDataType['restrictions'], value: any) => void;
  handleArrayItemAdd: (category: string, subcategory: string, value: string) => void;
  handleArrayItemRemove: (category: string, subcategory: string, field: string, index: number) => void;
  handleCheckboxToggle: (category: string, field: string, value: string) => void;
  validateBasicInfo: () => boolean;
}

export const getFormSteps = ({
  formData,
  handleChange,
  handleNestedChange,
  handleDemographicChange,
  handleGeographicChange,
  handleAudienceSupportsChange,
  handleCampaignChange,
  handleRestrictionsChange,
  handleArrayItemAdd,
  handleArrayItemRemove,
  handleCheckboxToggle,
  validateBasicInfo
}: FormStepsProps) => {
  return [
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
};
