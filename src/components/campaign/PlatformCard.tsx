
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Platform } from "@/types/campaign";

interface PlatformCardProps {
  platform: Platform;
  isSelected: boolean;
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  formatUserCount: (count: string | number | null | undefined) => string;
  campaignDays?: number; // Add optional campaignDays prop
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  isSelected,
  autoSuggestEnabled,
  togglePlatform,
  formatUserCount,
  campaignDays, // Add campaignDays to props
}) => {
  return (
    <Card
      key={platform.id}
      className={`p-4 cursor-pointer transition-all ${
        isSelected
          ? "bg-primary/10 dark:bg-primary/20"
          : ""
      }`}
      onClick={() => !autoSuggestEnabled && togglePlatform(platform.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Use optional chaining for logo_url since it might not exist */}
          {platform.logo_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={platform.logo_url}
                alt={platform.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
            checked={isSelected}
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

      {/* Show audience match details */}
      {isSelected && platform.audience_data && (
        <div className="mt-2 text-sm">
          <div className="text-green-600 dark:text-green-400 text-xs flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Matching audience profiles</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlatformCard;
