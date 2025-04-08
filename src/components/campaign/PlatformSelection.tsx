
import React from "react";
import { CampaignData } from "@/types/campaign";
import { formatUserCount } from "./platformSelectionUtils";
import PlatformSelectionHeader from "./platformSelection/PlatformSelectionHeader";
import PlatformSelectionContent from "./platformSelection/PlatformSelectionContent";
import PlatformSelectionFooter from "./platformSelection/PlatformSelectionFooter";
import { usePlatformSelection } from "./platformSelection/usePlatformSelection";

interface PlatformSelectionProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({
  data,
  updateData,
}) => {
  const {
    platforms,
    loading,
    searchQuery,
    setSearchQuery,
    selectedPlatforms,
    autoSuggestEnabled,
    toggleAutoSuggest,
    togglePlatform,
    showAssetSelection,
    setShowAssetSelection,
    handleAssetSelect
  } = usePlatformSelection(data, updateData);

  return (
    <div>
      <PlatformSelectionHeader 
        autoSuggestEnabled={autoSuggestEnabled}
        toggleAutoSuggest={toggleAutoSuggest}
        showAssetSelection={showAssetSelection}
        setShowAssetSelection={setShowAssetSelection}
      />

      <PlatformSelectionContent 
        platforms={platforms}
        selectedPlatforms={selectedPlatforms}
        autoSuggestEnabled={autoSuggestEnabled}
        togglePlatform={togglePlatform}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        formatUserCount={formatUserCount}
        showAssetSelection={showAssetSelection}
        handleAssetSelect={handleAssetSelect}
        campaignDays={data.durationDays}
      />

      <PlatformSelectionFooter 
        selectedPlatforms={selectedPlatforms} 
      />
    </div>
  );
};

export default PlatformSelection;
