
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

interface CampaignSectionProps {
  campaignData: any;
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

  const adFormats = [
    "Static Masthead",
    "Video Masthead",
    "Shoppable Story",
    "Scratch Card",
    "Banner Ads",
    "Native Ads",
  ];

  const specialInnovations = [
    "Category Rail",
    "Tap-to-Reveal",
    "Shake-to-Redirect",
    "Interactive Stories",
    "AR Filters",
  ];

  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
      <div className="space-y-4">
        <div>
          <Label>Campaign Funnel Stage</Label>
          <Select 
            value={campaignData.funnel_stage}
            onValueChange={(value) => onCampaignDataChange("funnel_stage", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select funnel stage" />
            </SelectTrigger>
            <SelectContent>
              {funnelStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Buying Model</Label>
          <Select
            value={campaignData.buying_model}
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
          <Label>Minimum Campaign Spend (INR)</Label>
          <NeuInput
            type="number"
            placeholder="e.g., 500000"
            value={campaignData.minimum_spend || ""}
            onChange={(e) => onCampaignDataChange("minimum_spend", e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div>
          <Label>Platform Presence (Geography)</Label>
          <NeuInput
            placeholder="e.g., Pan-India"
            value={campaignData.geography_presence || ""}
            onChange={(e) => onCampaignDataChange("geography_presence", e.target.value)}
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
