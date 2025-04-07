import React from "react";
import PlatformCard from "./PlatformCard";
import { Platform } from "@/types/campaign";

interface PlatformListProps {
  platforms: Platform[];
  selectedPlatforms: string[];
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  searchQuery: string;
  loading: boolean;
  formatUserCount: (count: string | number | null | undefined) => string;
}

const PlatformList: React.FC<PlatformListProps> = ({
  platforms,
  selectedPlatforms,
  autoSuggestEnabled,
  togglePlatform,
  searchQuery,
  loading,
  formatUserCount,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platformsToDisplay.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          isSelected={selectedPlatforms.includes(platform.id)}
          autoSuggestEnabled={autoSuggestEnabled}
          togglePlatform={togglePlatform}
          formatUserCount={formatUserCount}
        />
      ))}
    </div>
  );
};

export default PlatformList;
