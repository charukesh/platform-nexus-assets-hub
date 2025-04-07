
import React, { useEffect, useState } from "react";
import { CampaignData, Asset, PlatformWithAssets } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PlatformList from "./PlatformList";
import PlatformSearchBar from "./PlatformSearchBar";
import PlatformAutoSuggestToggle from "./PlatformAutoSuggestToggle";
import { 
  Platform, 
  formatUserCount, 
  fetchPlatformsFromSupabase 
} from "./platformSelectionUtils";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSelectionProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({
  data,
  updateData,
}) => {
  const [platforms, setPlatforms] = useState<PlatformWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    data.platformPreferences || []
  );
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(
    data.platformPreferences.length === 0
  );
  const [showAssetSelection, setShowAssetSelection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  useEffect(() => {
    updateData({ platformPreferences: selectedPlatforms });
  }, [selectedPlatforms]);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      
      // Fetch platforms
      const platformsData = await fetchPlatformsFromSupabase(
        data, 
        autoSuggestEnabled, 
        setSelectedPlatforms
      );

      // Fetch assets for each platform
      const platformsWithAssets = await Promise.all(platformsData.map(async (platform) => {
        const { data: assetsData, error } = await supabase
          .from('assets')
          .select('*')
          .eq('platform_id', platform.id);
          
        if (error) {
          console.error("Error fetching assets:", error);
          return {
            ...platform,
            assets: []
          };
        }
        
        return {
          ...platform,
          assets: assetsData || [],
          selectedAssets: data.selectedAssets?.[platform.id] || []
        };
      }));
      
      setPlatforms(platformsWithAssets as PlatformWithAssets[]);
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleAutoSuggest = () => {
    const newAutoSuggestState = !autoSuggestEnabled;
    setAutoSuggestEnabled(newAutoSuggestState);

    if (newAutoSuggestState) {
      // Clear manual selections and auto-suggest
      const suggestedPlatforms = platforms.slice(0, 3).map((p) => p.id);
      setSelectedPlatforms(suggestedPlatforms);
    } else {
      // Clear auto-suggested platforms
      setSelectedPlatforms([]);
    }
  };

  const handleAssetSelect = (platformId: string, assetId: string, selected: boolean) => {
    // Update the selected assets in the local state
    const updatedPlatforms = platforms.map(platform => {
      if (platform.id === platformId) {
        const currentSelectedAssets = platform.selectedAssets || [];
        const newSelectedAssets = selected
          ? [...currentSelectedAssets, assetId]
          : currentSelectedAssets.filter(id => id !== assetId);
        
        return {
          ...platform,
          selectedAssets: newSelectedAssets
        };
      }
      return platform;
    });
    
    setPlatforms(updatedPlatforms);
    
    // Update the campaign data with the selected assets
    const selectedAssets = { ...data.selectedAssets } || {};
    if (selected) {
      selectedAssets[platformId] = [
        ...(selectedAssets[platformId] || []),
        assetId
      ];
    } else {
      selectedAssets[platformId] = (selectedAssets[platformId] || [])
        .filter(id => id !== assetId);
    }
    
    updateData({ selectedAssets });
  };

  return (
    <div>
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
        campaignDays={data.durationDays}
      />

      {selectedPlatforms.length > 0 && (
        <div className="mt-6 p-4 border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-green-700 dark:text-green-400">
            <span className="font-medium">
              {selectedPlatforms.length} platform
              {selectedPlatforms.length !== 1 ? "s" : ""} selected
            </span>{" "}
            for your campaign
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformSelection;
