
import React, { useEffect, useState } from "react";
import { CampaignData } from "@/pages/CampaignQuotation";
import NeuCard from "@/components/NeuCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlatformSelectionProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

interface Platform {
  id: string;
  name: string;
  industry: string;
  mau: string | number;
  dau: string | number;
  premium_users: number;
  description?: string;
  logo_url?: string;
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
      let query = supabase.from("platforms").select("*");

      // Filter by industry if specified
      if (data.industry) {
        query = query.eq("industry", data.industry);
      }

      const { data: platformsData, error } = await query;

      if (error) {
        throw error;
      }

      if (platformsData) {
        setPlatforms(platformsData);

        // Auto-suggest platforms if no manual selection
        if (autoSuggestEnabled && data.platformPreferences.length === 0) {
          const suggestedPlatforms = platformsData
            .slice(0, 3)
            .map((platform) => platform.id);
          setSelectedPlatforms(suggestedPlatforms);
        }
      }
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

  const formatUserCount = (count: string | number | null | undefined): string => {
    if (!count) return "N/A";
    
    const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
    if (isNaN(Number(numValue))) return "N/A";
    
    return `${Math.round(Number(numValue) / 1000000)}M`;
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

  const filteredPlatforms = platforms.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Select Platforms</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-suggest"
            checked={autoSuggestEnabled}
            onCheckedChange={toggleAutoSuggest}
          />
          <label
            htmlFor="auto-suggest"
            className="text-sm cursor-pointer flex items-center gap-1"
          >
            Auto-suggest platforms
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The system will automatically suggest appropriate platforms
                    based on your campaign requirements
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
        </div>
      </div>

      {/* Search and Filter */}
      {!autoSuggestEnabled && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search platforms..."
              className="pl-10 neu-pressed dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Platform Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(autoSuggestEnabled
            ? platforms.filter((p) => selectedPlatforms.includes(p.id))
            : filteredPlatforms
          ).map((platform) => (
            <NeuCard
              key={platform.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedPlatforms.includes(platform.id)
                  ? "bg-primary/10 dark:bg-primary/20"
                  : ""
              }`}
              onClick={() => !autoSuggestEnabled && togglePlatform(platform.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {platform.logo_url ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neugray-200 dark:bg-gray-700">
                      <img
                        src={platform.logo_url}
                        alt={platform.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neugray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {platform.industry}
                    </p>
                  </div>
                </div>

                {!autoSuggestEnabled && (
                  <Checkbox
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                    className="mt-1"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  MAU/DAU: {formatUserCount(platform.mau)}/{formatUserCount(platform.dau)}
                </span>
              </div>

              {platform.description && (
                <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">
                  {platform.description}
                </p>
              )}
            </NeuCard>
          ))}
        </div>
      )}

      {!loading && filteredPlatforms.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No platforms found</p>
        </div>
      )}

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
