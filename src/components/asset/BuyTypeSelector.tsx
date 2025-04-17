
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BUY_TYPE_OPTIONS } from "@/types/asset";

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
        <Select 
          value={buyType} 
          onValueChange={(value) => onChange('buy_types', value)}
        >
          <SelectTrigger className="mt-1.5 bg-white border-none neu-flat hover:shadow-neu-pressed">
            <SelectValue placeholder="Select buy type" />
          </SelectTrigger>
          <SelectContent>
            {BUY_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
