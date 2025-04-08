
import React from "react";
import PlatformAutoSuggestToggle from "../PlatformAutoSuggestToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PlatformSelectionHeaderProps {
  autoSuggestEnabled: boolean;
  toggleAutoSuggest: () => void;
  showAssetSelection: boolean;
  setShowAssetSelection: (show: boolean) => void;
}

const PlatformSelectionHeader: React.FC<PlatformSelectionHeaderProps> = ({
  autoSuggestEnabled,
  toggleAutoSuggest,
  showAssetSelection,
  setShowAssetSelection,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Select Platforms</h2>
        <PlatformAutoSuggestToggle 
          autoSuggestEnabled={autoSuggestEnabled}
          toggleAutoSuggest={toggleAutoSuggest}
        />
      </div>

      {/* Asset Selection Toggle */}
      <div className="flex items-center space-x-2 mb-6">
        <Switch
          id="asset-selection"
          checked={showAssetSelection}
          onCheckedChange={setShowAssetSelection}
        />
        <Label htmlFor="asset-selection">Manually select assets for each platform</Label>
      </div>
    </>
  );
};

export default PlatformSelectionHeader;
