
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Platform, Asset } from "@/types/campaign";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlatformCardProps {
  platform: Platform;
  isSelected: boolean;
  autoSuggestEnabled: boolean;
  togglePlatform: (platformId: string) => void;
  formatUserCount: (count: string | number | null | undefined) => string;
  campaignDays?: number;
  assets?: Asset[];
  onAssetSelect?: (platformId: string, assetId: string, selected: boolean) => void;
  selectedAssets?: string[];
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  isSelected,
  autoSuggestEnabled,
  togglePlatform,
  formatUserCount,
  campaignDays,
  assets = [],
  onAssetSelect,
  selectedAssets = []
}) => {
  const [showAssets, setShowAssets] = React.useState(false);

  return (
    <Card
      key={platform.id}
      className={`p-4 mb-4 transition-all ${
        isSelected
          ? "bg-primary/10 dark:bg-primary/20"
          : ""
      }`}
    >
      <div className="flex items-start justify-between cursor-pointer"
           onClick={() => !autoSuggestEnabled && togglePlatform(platform.id)}>
        <div className="flex items-center gap-3">
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
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div className="mt-3 flex items-center text-sm">
        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
        <span className="text-muted-foreground">
          MAU/DAU: {formatUserCount(platform.mau)}/{formatUserCount(platform.dau)}
        </span>
      </div>

      {isSelected && platform.audience_data && (
        <div className="mt-2 text-sm">
          <div className="text-green-600 dark:text-green-400 text-xs flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Matching audience profiles</span>
          </div>
        </div>
      )}
      
      {/* Show asset selection if platform is selected and has assets */}
      {isSelected && assets.length > 0 && onAssetSelect && (
        <Collapsible open={showAssets} onOpenChange={setShowAssets} className="mt-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-primary py-2">
            <span>Select Assets ({selectedAssets.length}/{assets.length})</span>
            {showAssets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-sm">{asset.name}</div>
                  <div className="flex mt-1 gap-2">
                    <Badge variant="outline" className="text-xs">
                      {asset.category}
                    </Badge>
                    {campaignDays && (
                      <div className="text-xs text-muted-foreground">
                        Est. cost: ${(asset.cost_per_day * campaignDays).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <Checkbox
                  checked={selectedAssets.includes(asset.id)}
                  onCheckedChange={(checked) => {
                    onAssetSelect(platform.id, asset.id, Boolean(checked));
                  }}
                  className="ml-2"
                />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};

export default PlatformCard;
