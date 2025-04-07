
import { usePlatformFormState } from "./platform-form/usePlatformFormState";
import { usePlatformFormHandlers } from "./platform-form/usePlatformFormHandlers";
import { usePlatformFormArrays } from "./platform-form/usePlatformFormArrays";
import { usePlatformFormSubmit } from "./platform-form/usePlatformFormSubmit";

export const usePlatformForm = () => {
  const {
    id,
    isEditMode,
    loading,
    setLoading,
    fetchLoading,
    formData,
    setFormData,
    toast
  } = usePlatformFormState();

  const {
    handleChange,
    handleNestedChange,
    handleDemographicChange,
    handleGeographicChange,
    handleAudienceSupportsChange,
    handleCampaignChange,
    handleRestrictionsChange
  } = usePlatformFormHandlers(formData, setFormData);

  const {
    handleArrayItemAdd,
    handleArrayItemRemove,
    handleCheckboxToggle
  } = usePlatformFormArrays(
    formData,
    handleGeographicChange,
    handleDemographicChange,
    handleCampaignChange,
    handleRestrictionsChange
  );

  const {
    validateBasicInfo,
    handleSubmit,
    navigate
  } = usePlatformFormSubmit(formData, id, setLoading, toast);

  return {
    isEditMode,
    loading,
    fetchLoading,
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
    handleSubmit,
    validateBasicInfo,
    navigate
  };
};
