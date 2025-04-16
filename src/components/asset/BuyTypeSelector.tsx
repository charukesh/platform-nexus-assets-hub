
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BuyTypeSelectorProps {
  buyType: string;
  amount: number;
  estimatedImpressions: number;
  estimatedClicks: number;
  onChange: (field: string, value: any) => void;
}

const BuyTypeSelector = ({
  buyType,
  amount,
  estimatedImpressions,
  estimatedClicks,
  onChange
}: BuyTypeSelectorProps) => {
  const handleNumericChange = (field: string, value: string) => {
    // Parse the input value as a number, ensuring we don't pass NaN
    const numericValue = value === '' ? 0 : parseFloat(value);
    onChange(field, isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Buy Type*</Label>
        <RadioGroup 
          value={buyType} 
          onValueChange={(value) => onChange('buy_types', value)}
          className="mt-2 flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CPC" id="cpc" />
            <label htmlFor="cpc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              CPC
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CPM" id="cpm" />
            <label htmlFor="cpm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              CPM
            </label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="amount">Amount*</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => handleNumericChange('amount', e.target.value)}
          className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
          required
        />
      </div>

      <div>
        <Label htmlFor="estimated_impressions">Estimated Impressions*</Label>
        <Input
          id="estimated_impressions"
          type="number"
          value={estimatedImpressions}
          onChange={(e) => handleNumericChange('estimated_impressions', e.target.value)}
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
          onChange={(e) => handleNumericChange('estimated_clicks', e.target.value)}
          className="mt-1.5 bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
          required
        />
      </div>
    </div>
  );
};

export default BuyTypeSelector;
