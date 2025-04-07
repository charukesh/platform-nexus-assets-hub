
import React, { useState } from "react";
import { Asset, PlatformWithAssets } from "@/types/campaign";
import NeuCard from "@/components/NeuCard";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, 
  ChevronUp, 
  UserCircle, 
  Calendar, 
  Target
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatUtils";
import AssetItem from "./AssetItem";

interface PlatformCardProps {
  platform: PlatformWithAssets;
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
  campaignDays = 1,
  assets = [],
  onAssetSelect,
  selectedAssets = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleToggle = () => {
    togglePlatform(platform.id);
  };

  const showAssets = assets.length > 0 && onAssetSelect;

  return (
    <NeuCard className="mb-4 p-0 overflow-hidden">
      <div className={`p-4 ${isSelected ? 'bg-primary/5' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Checkbox for platform selection */}
          {!autoSuggestEnabled && (
            <div className="pt-1">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={handleToggle}
                id={`platform-${platform.id}`}
              />
            </div>
          )}
          
          {/* Platform info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{platform.name}</h3>
                <p className="text-sm text-muted-foreground">{platform.industry}</p>
              </div>
              
              {/* Only show cost if the platform is selected */}
              {isSelected && platform.totalCost !== undefined && (
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatCurrency(platform.totalCost)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated Cost ({campaignDays} days)
                  </p>
                </div>
              )}
            </div>
            
            {/* Platform stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div className="flex items-center gap-2">
                <UserCircle size={16} className="text-primary" />
                <span className="text-sm">
                  MAU: {formatUserCount(platform.mau)}
                </span>
              </div>
              
              {isSelected && platform.totalImpressions && (
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  <span className="text-sm">
                    Est. Impressions: {formatNumber(platform.totalImpressions)}
                  </span>
                </div>
              )}
              
              {isSelected && platform.totalCost && platform.totalImpressions && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm">
                    CPM: {formatCurrency((platform.totalCost / platform.totalImpressions) * 1000)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Toggle button for assets */}
            {showAssets && (
              <button 
                onClick={toggleExpand}
                className="flex items-center gap-1 mt-3 text-sm font-medium text-primary"
              >
                {isExpanded ? (
                  <>Hide Assets <ChevronUp size={16} /></>
                ) : (
                  <>Show Assets ({assets.length}) <ChevronDown size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Display assets when expanded */}
      {showAssets && isExpanded && (
        <div className="border-t border-muted">
          <div className="p-4">
            <h4 className="text-sm font-semibold mb-3">Available Assets</h4>
            <div className="space-y-3">
              {assets.map((asset) => (
                <AssetItem 
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssets.includes(asset.id)}
                  onSelect={(selected) => {
                    if (onAssetSelect) {
                      onAssetSelect(platform.id, asset.id, selected);
                    }
                  }}
                  campaignDays={campaignDays}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </NeuCard>
  );
};

export default PlatformCard;
