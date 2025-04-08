
import React from "react";
import PlatformList from "../PlatformList";
import PlatformSearchBar from "../PlatformSearchBar";
import { CampaignData, PlatformWithAssets } from "@/types/campaign";

interface PlatformSelectionContentProps {
  platforms: PlatformWithAssets[];
  selectedPlatforms: string[];
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  formatUserCount: (count: string | number | null | undefined) => string;
  showAssetSelection: boolean;
  handleAssetSelect: (platformId: string, assetId: string, selected: boolean) => void;
  campaignDays: number;
}

const PlatformSelectionContent: React.FC<PlatformSelectionContentProps> = ({
  platforms,
  selectedPlatforms,
  autoSuggestEnabled,
  togglePlatform,
  searchQuery,
  setSearchQuery,
  loading,
  formatUserCount,
  showAssetSelection,
  handleAssetSelect,
  campaignDays
}) => {
  return (
    <>
      {/* Search and Filter */}
      {!autoSuggestEnabled && (
        <div className="mb-6">
          <PlatformSearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>
      )}

      {/* Platform Listing */}
      <PlatformList
        platforms={platforms}
        selectedPlatforms={selectedPlatforms}
        autoSuggestEnabled={autoSuggestEnabled}
        togglePlatform={togglePlatform}
        searchQuery={searchQuery}
        loading={loading}
        formatUserCount={formatUserCount}
        showAssetSelection={showAssetSelection}
        onAssetSelect={handleAssetSelect}
        campaignDays={campaignDays}
      />
    </>
  );
};

export default PlatformSelectionContent;
