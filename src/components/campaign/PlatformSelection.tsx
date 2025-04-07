import React, { useEffect, useState } from "react";
import { CampaignData } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import PlatformList from "./PlatformList";
import PlatformSearchBar from "./PlatformSearchBar";
import PlatformAutoSuggestToggle from "./PlatformAutoSuggestToggle";
import { 
  Platform, 
  formatUserCount, 
  fetchPlatformsFromSupabase 
} from "./platformSelectionUtils";

interface PlatformSelectionProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({
  data,
  updateData,
}) => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    data.platformPreferences || []
  );
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(
    data.platformPreferences.length === 0
  );
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
      
      const platformsData = await fetchPlatformsFromSupabase(
        data, 
        autoSuggestEnabled, 
        setSelectedPlatforms
      );
      
      setPlatforms(platformsData as Platform[]);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Select Platforms</h2>
        <PlatformAutoSuggestToggle 
          autoSuggestEnabled={autoSuggestEnabled}
          toggleAutoSuggest={toggleAutoSuggest}
        />
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
