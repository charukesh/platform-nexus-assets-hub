
import React from "react";
import PlatformCard from "./PlatformCard";
import { PlatformWithAssets } from "@/types/campaign";

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
  // Filter platforms based on search query
  const filteredPlatforms = platforms.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the platforms to display based on autosuggest setting
  const platformsToDisplay = autoSuggestEnabled
    ? platforms.filter((p) => selectedPlatforms.includes(p.id))
    : filteredPlatforms;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (platformsToDisplay.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No platforms found</p>
      </div>
    );
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
          selectedAssets={platform.selectedAssets}
        />
      ))}
    </div>
  );
};

export default PlatformList;
