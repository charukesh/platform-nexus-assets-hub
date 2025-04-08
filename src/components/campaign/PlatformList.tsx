
import React from "react";
import PlatformCard from "./PlatformCard";
import { PlatformWithAssets } from "@/types/campaign";
import LoadingPlatforms from "./LoadingPlatforms";
import EmptyPlatforms from "./EmptyPlatforms";

interface PlatformListProps {
  platforms: PlatformWithAssets[];
  selectedPlatforms: string[];
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  searchQuery: string;
  loading: boolean;
  formatUserCount: (count: string | number | null | undefined) => string;
  showAssetSelection?: boolean;
  onAssetSelect?: (platformId: string, assetId: string, selected: boolean) => void;
  campaignDays?: number;
}

const PlatformList: React.FC<PlatformListProps> = ({
  platforms,
  selectedPlatforms,
  autoSuggestEnabled,
  togglePlatform,
  searchQuery,
  loading,
  formatUserCount,
  showAssetSelection = false,
  onAssetSelect,
  campaignDays
}) => {
  // Ensure platforms is always an array
  const platformsArray = Array.isArray(platforms) ? platforms : [];
  
  // Filter platforms based on search query
  const filteredPlatforms = platformsArray.filter((platform) =>
    platform.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  // Get the platforms to display based on autosuggest setting
  const platformsToDisplay = autoSuggestEnabled
    ? platformsArray.filter((p) => selectedPlatforms.includes(p.id))
    : filteredPlatforms;

  if (loading) {
    return <LoadingPlatforms />;
  }

  if (platformsToDisplay.length === 0) {
    return <EmptyPlatforms />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {platformsToDisplay.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          isSelected={selectedPlatforms.includes(platform.id)}
          autoSuggestEnabled={autoSuggestEnabled}
          togglePlatform={togglePlatform}
          formatUserCount={formatUserCount}
          campaignDays={campaignDays}
          assets={showAssetSelection && selectedPlatforms.includes(platform.id) ? platform.assets : []}
          onAssetSelect={showAssetSelection ? onAssetSelect : undefined}
          selectedAssets={platform.selectedAssets || []}
        />
      ))}
    </div>
  );
};

export default PlatformList;
