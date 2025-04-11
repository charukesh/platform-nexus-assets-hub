
import React from "react";
import PlatformSearchBar from "../PlatformSearchBar";
import PlatformList from "../PlatformList";
import { PlatformWithAssets } from "@/types/campaign";

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
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">Platform Selection</h3>
      <p className="text-muted-foreground">
        The campaign feature has been removed. Please contact your administrator for more information.
      </p>
    </div>
  );
};

export default PlatformSelectionContent;
