
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CampaignData, PlatformWithAssets } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";
import { fetchPlatformsFromSupabase } from "../platformSelectionUtils";

export const usePlatformSelection = (
  data: CampaignData,
  updateData: (data: Partial<CampaignData>) => void
) => {
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
    const selectedAssets = data.selectedAssets ? { ...data.selectedAssets } : {};
    
    if (selected) {
      selectedAssets[platformId] = [
        ...(selectedAssets[platformId] || []),
        assetId
      ];
    } else if (selectedAssets[platformId]) {
      selectedAssets[platformId] = selectedAssets[platformId]
        .filter(id => id !== assetId);
    }
    
    updateData({ selectedAssets });
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
