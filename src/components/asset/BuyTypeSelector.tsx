
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface BuyTypeSelectorProps {
  buyTypes: string[];
  estimatedImpressions: number;
  estimatedClicks: number;
  onChange: (field: string, value: any) => void;
}

const BuyTypeSelector = ({
  buyTypes,
  estimatedImpressions,
  estimatedClicks,
  onChange
}: BuyTypeSelectorProps) => {
  const handleBuyTypeChange = (type: string, checked: boolean) => {
    const newBuyTypes = checked 
      ? [...buyTypes, type]
      : buyTypes.filter(t => t !== type);
    onChange('buyTypes', newBuyTypes);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Buy Types*</Label>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cpc"
              checked={buyTypes.includes('CPC')}
              onCheckedChange={(checked) => handleBuyTypeChange('CPC', checked as boolean)}
            />
            <label htmlFor="cpc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              CPC
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cpm"
              checked={buyTypes.includes('CPM')}
              onCheckedChange={(checked) => handleBuyTypeChange('CPM', checked as boolean)}
            />
            <label htmlFor="cpm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              CPM
            </label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="estimated_impressions">Estimated Impressions*</Label>
        <Input
          id="estimated_impressions"
          type="number"
          value={estimatedImpressions}
          onChange={(e) => onChange('estimatedImpressions', parseInt(e.target.value, 10) || 0)}
          className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
          required
        />
      </div>

      <div>
        <Label htmlFor="estimated_clicks">Estimated Clicks*</Label>
        <Input
          id="estimated_clicks"
          type="number"
          value={estimatedClicks}
          onChange={(e) => onChange('estimatedClicks', parseInt(e.target.value, 10) || 0)}
          className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
          required
        />
      </div>
    </div>
  );
};

export default BuyTypeSelector;
