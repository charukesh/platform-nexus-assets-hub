
import React from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import MultiStepForm from "@/components/MultiStepForm";
import { usePlatformForm } from "@/hooks/usePlatformForm";
import { getFormSteps } from "@/components/platform-form/FormSteps";

const PlatformForm: React.FC = () => {
  const {
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
  } = usePlatformForm();

  const formSteps = getFormSteps({
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
  });

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
