
import React from "react";
import { PlatformWithAssets } from "@/types/campaign";

interface PlatformListProps {
  platforms: PlatformWithAssets[];
  selectedPlatforms: string[];
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  searchQuery: string;
  loading: boolean;
  formatUserCount: (count: string | number | null | undefined) => string;
  showAssetSelection: boolean;
  onAssetSelect: (platformId: string, assetId: string, selected: boolean) => void;
  campaignDays: number;
}

// A placeholder implementation for backward compatibility
const PlatformList: React.FC<PlatformListProps> = ({ 
  platforms,
  loading,
  searchQuery
}) => {
  if (loading) {
    return <div>Loading platforms...</div>;
  }

  if (platforms.length === 0) {
    return <div>No platforms match your search criteria.</div>;
  }

  return (
    <div>
      <p>The campaign feature has been removed. Please contact your administrator for more information.</p>
    </div>
  );
};

export default PlatformList;
