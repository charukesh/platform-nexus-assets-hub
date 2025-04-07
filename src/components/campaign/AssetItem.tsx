
import React from "react";
import { Asset } from "@/types/campaign";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatUtils";

interface AssetItemProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  campaignDays?: number;
}

const AssetItem: React.FC<AssetItemProps> = ({ 
  asset, 
  isSelected, 
  onSelect,
  campaignDays = 1
}) => {
  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
      <Checkbox 
        id={`asset-${asset.id}`}
        checked={isSelected}
        onCheckedChange={onSelect}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <Label 
            htmlFor={`asset-${asset.id}`}
            className="font-medium cursor-pointer"
          >
            {asset.name}
          </Label>
          {asset.cost_per_day && (
            <span className="text-sm font-medium">
              {formatCurrency(asset.cost_per_day * campaignDays)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{asset.description}</p>
        {asset.dimensions && (
          <div className="text-xs text-muted-foreground mt-1">
            Dimensions: {asset.dimensions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetItem;
