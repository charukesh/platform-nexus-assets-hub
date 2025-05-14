
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CampaignData, AD_FORMAT_OPTIONS, PLACEMENT_OPTIONS, FUNNEL_STAGE_OPTIONS } from "@/types/platform";

interface CampaignSectionProps {
  campaignData: CampaignData;
  onCampaignDataChange: (field: string, value: any) => void;
}

export const CampaignSection: React.FC<CampaignSectionProps> = ({
  campaignData,
  onCampaignDataChange,
}) => {
  // Helper function for multi-select options
  const handleMultiSelectChange = (field: string, value: string) => {
    const currentValues = campaignData[field as keyof CampaignData] as string[] || [];
    let newValues;
    
    if (Array.isArray(currentValues)) {
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
    } else {
      newValues = [value];
    }
    
    onCampaignDataChange(field, newValues);
  };

  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Capabilities & Innovation</h2>
      <div className="space-y-6">
        <div>
          <Label className="block mb-2">Ad Formats</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {AD_FORMAT_OPTIONS.map((format) => (
              <div 
                key={format}
                onClick={() => handleMultiSelectChange('ad_formats', format)}
                className={`
                  cursor-pointer rounded-md p-2 border border-gray-300 text-center
                  ${(campaignData.ad_formats || []).includes(format) 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-white hover:bg-gray-50'}
                `}
              >
                {format}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="block mb-2">Available Placements</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PLACEMENT_OPTIONS.map((placement) => (
              <div 
                key={placement}
                onClick={() => handleMultiSelectChange('available_placements', placement)}
                className={`
                  cursor-pointer rounded-md p-2 border border-gray-300
                  ${(campaignData.available_placements || []).includes(placement) 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-white hover:bg-gray-50'}
                `}
              >
                {placement}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="block mb-2">Funnel Stages</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {FUNNEL_STAGE_OPTIONS.map((stage) => (
              <div 
                key={stage}
                onClick={() => handleMultiSelectChange('funnel_stage', stage)}
                className={`
                  cursor-pointer rounded-md p-2 border border-gray-300 text-center
                  ${Array.isArray(campaignData.funnel_stage) 
                    ? campaignData.funnel_stage.includes(stage)
                    : campaignData.funnel_stage === stage
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-white hover:bg-gray-50'}
                `}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="cta_support">CTA Support</Label>
            <Switch
              id="cta_support"
              checked={campaignData.cta_support || false}
              onCheckedChange={(checked) => onCampaignDataChange('cta_support', checked)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="minimum_spend">Minimum Campaign Spend (₹)</Label>
          <Input
            id="minimum_spend"
            type="number"
            min="0"
            value={campaignData.minimum_spend || ''}
            onChange={(e) => onCampaignDataChange('minimum_spend', e.target.value ? parseInt(e.target.value) : 0)}
            className="mt-1"
            placeholder="Enter minimum campaign spend"
          />
        </div>

        <div>
          <Label htmlFor="special_innovations">Special Innovations</Label>
          <NeuInput
            id="special_innovations"
            as="textarea"
            value={campaignData.special_innovations || ''}
            onChange={(e) => onCampaignDataChange('special_innovations', e.target.value)}
            placeholder="Describe any special innovations or unique offerings"
            rows={3}
          />
        </div>
      </div>
    </NeuCard>
  );
};
