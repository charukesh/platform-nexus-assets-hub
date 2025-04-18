
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NeuInput from "@/components/NeuInput";
import { Switch } from "@/components/ui/switch";
import NeuCard from "@/components/NeuCard";
import { CampaignData } from "@/types/platform";
import CommaSeparatedInput from "@/components/CommaSeparatedInput";

interface CampaignSectionProps {
  campaignData: CampaignData;
  onCampaignDataChange: (field: string, value: any) => void;
}

export const CampaignSection = ({
  campaignData,
  onCampaignDataChange,
}: CampaignSectionProps) => {
  const funnelStages = [
    "Awareness",
    "Consideration",
    "Conversion",
    "Branding & Call-to-Action",
  ];

  const buyingModels = [
    "CPC (Cost Per Click)",
    "CPM (Cost Per Mille)",
    "CPO (Cost Per Order)",
    "CPS (Cost Per Scratch)",
  ];

  const handleFunnelStageChange = (stage: string, checked: boolean) => {
    const currentStages = campaignData.funnel_stage ? 
      (typeof campaignData.funnel_stage === 'string' ? [campaignData.funnel_stage] : campaignData.funnel_stage) : 
      [];
    
    const updatedStages = checked
      ? [...currentStages, stage]
      : currentStages.filter((s: string) => s !== stage);
    
    onCampaignDataChange("funnel_stage", updatedStages);
  };

  // Convert arrays to comma-separated strings for the input component
  const getAdFormatsValue = () => {
    if (!campaignData.ad_formats) return '';
    return Array.isArray(campaignData.ad_formats) 
      ? campaignData.ad_formats.join(", ") 
      : campaignData.ad_formats;
  };

  const getSpecialInnovationsValue = () => {
    if (!campaignData.special_innovations) return '';
    return Array.isArray(campaignData.special_innovations) 
      ? campaignData.special_innovations.join(", ") 
      : campaignData.special_innovations;
  };

  const getGeographyPresenceValue = () => {
    if (!campaignData.geography_presence) return '';
    if (typeof campaignData.geography_presence === 'string') {
      return campaignData.geography_presence;
    }
    if (Array.isArray(campaignData.geography_presence)) {
      return campaignData.geography_presence.join(", ");
    }
    return '';
  };

  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
      <div className="space-y-6">
        <div>
          <Label className="text-base mb-3 block">Campaign Funnel Stages</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funnelStages.map((stage) => {
              const isChecked = Array.isArray(campaignData.funnel_stage) && 
                campaignData.funnel_stage.includes(stage);
                
              return (
                <div key={stage} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stage-${stage}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleFunnelStageChange(stage, checked === true)
                    }
                  />
                  <Label htmlFor={`stage-${stage}`}>{stage}</Label>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Buying Model</Label>
          <Select
            value={campaignData.buying_model || "undefined-model"}
            onValueChange={(value) => onCampaignDataChange("buying_model", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select buying model" />
            </SelectTrigger>
            <SelectContent>
              {buyingModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ad Formats</Label>
          <CommaSeparatedInput 
            placeholder="Enter ad formats (e.g., Banner, Video, Interstitial)"
            value={getAdFormatsValue()}
            onChange={(value) => {
              const formatsArray = value ? value.split(",").map(v => v.trim()).filter(Boolean) : [];
              onCampaignDataChange("ad_formats", formatsArray);
            }}
          />
        </div>

        <div>
          <Label>Special Innovations</Label>
          <CommaSeparatedInput 
            placeholder="Enter special innovations (e.g., AR, Interactive ads)"
            value={getSpecialInnovationsValue()}
            onChange={(value) => {
              const innovationsArray = value ? value.split(",").map(v => v.trim()).filter(Boolean) : [];
              onCampaignDataChange("special_innovations", innovationsArray);
            }}
          />
        </div>

        <div>
          <Label>Minimum Campaign Spend (INR)</Label>
          <NeuInput
            type="number"
            placeholder="e.g., 500000"
            value={campaignData.minimum_spend || ""}
            onChange={(e) => onCampaignDataChange("minimum_spend", e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div>
          <Label>Geography Presence</Label>
          <CommaSeparatedInput 
            placeholder="Enter geography (e.g., India, South Asia, Global)"
            value={getGeographyPresenceValue()}
            onChange={(value) => onCampaignDataChange("geography_presence", value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="cta-support"
            checked={campaignData.cta_support}
            onCheckedChange={(checked) => onCampaignDataChange("cta_support", checked)}
          />
          <Label htmlFor="cta-support">Call-to-Action (CTA) Support</Label>
        </div>
      </div>
    </NeuCard>
  );
};
