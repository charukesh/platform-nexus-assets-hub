
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CampaignData, PlatformWithAssets } from "@/types/campaign";

export const usePlatformSelection = (
  data: CampaignData,
  updateData: (data: Partial<CampaignData>) => void
) => {
  const [platforms, setPlatforms] = useState<PlatformWithAssets[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [showAssetSelection, setShowAssetSelection] = useState(false);
  const { toast } = useToast();

  // Simplified placeholder functions
  const fetchPlatforms = async () => {
    toast({
      title: "Campaign feature removed",
      description: "The campaign quotation feature has been removed from this application.",
      variant: "destructive",
    });
  };

  const togglePlatform = (platformId: string) => {
    // No-op
  };

  const toggleAutoSuggest = () => {
    // No-op
  };

  const handleAssetSelect = (platformId: string, assetId: string, selected: boolean) => {
    // No-op
  };

  return {
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
  };
};
