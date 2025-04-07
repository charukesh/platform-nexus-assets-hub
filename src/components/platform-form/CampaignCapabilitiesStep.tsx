
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FormDataType, buyTypes, funnelingOptions } from "@/utils/platformFormUtils";

interface CampaignCapabilitiesStepProps {
  formData: FormDataType;
  handleCheckboxToggle: (category: string, field: string, value: string) => void;
  handleCampaignChange: (field: keyof FormDataType['campaign_data'], value: any) => void;
}

const CampaignCapabilitiesStep: React.FC<CampaignCapabilitiesStepProps> = ({
  formData,
  handleCheckboxToggle,
  handleCampaignChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Buy Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {buyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`buy-${type}`}
                checked={formData.campaign_data.buyTypes.includes(type)}
                onCheckedChange={(checked) => handleCheckboxToggle('campaign_data', 'buyTypes', type)}
              />
              <label 
                htmlFor={`buy-${type}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Campaign Funneling</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {funnelingOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox 
                id={`funnel-${option}`}
                checked={formData.campaign_data.funneling.includes(option)}
                onCheckedChange={(checked) => handleCheckboxToggle('campaign_data', 'funneling', option)}
              />
              <label 
                htmlFor={`funnel-${option}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Innovation Capabilities</h3>
        <Textarea
          id="innovations"
          placeholder="Describe any unique innovation capabilities..."
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0 resize-none h-32"
          value={formData.campaign_data.innovations}
          onChange={(e) => handleCampaignChange('innovations', e.target.value)}
        />
      </div>
    </div>
  );
};

export { CampaignCapabilitiesStep, type CampaignCapabilitiesStepProps };
