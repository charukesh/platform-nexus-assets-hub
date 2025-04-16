
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import NeuInput from "@/components/NeuInput";
import NeuCard from "@/components/NeuCard";
import { AudienceData } from "@/types/platform";

interface TargetingSectionProps {
  audienceData: AudienceData;
  onAudienceDataChange: (field: string, value: any) => void;
}

export const TargetingSection = ({
  audienceData,
  onAudienceDataChange,
}: TargetingSectionProps) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Targeting Options</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="age-targeting"
              checked={audienceData.age_targeting_available}
              onCheckedChange={(checked) =>
                onAudienceDataChange("age_targeting_available", checked)
              }
            />
            <Label htmlFor="age-targeting">Age Targeting Available</Label>
          </div>
          {audienceData.age_targeting_available && (
            <NeuInput
              placeholder="Enter age ranges (comma-separated)"
              value={audienceData.age_targeting_values || ''}
              onChange={(e) => onAudienceDataChange("age_targeting_values", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="gender-targeting"
              checked={audienceData.gender_targeting_available}
              onCheckedChange={(checked) =>
                onAudienceDataChange("gender_targeting_available", checked)
              }
            />
            <Label htmlFor="gender-targeting">Gender Targeting Available</Label>
          </div>
          {audienceData.gender_targeting_available && (
            <NeuInput
              placeholder="Enter gender options (comma-separated)"
              value={audienceData.gender_targeting_values || ''}
              onChange={(e) => onAudienceDataChange("gender_targeting_values", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="state-targeting"
              checked={audienceData.state_level_targeting}
              onCheckedChange={(checked) =>
                onAudienceDataChange("state_level_targeting", checked)
              }
            />
            <Label htmlFor="state-targeting">State-Level Targeting</Label>
          </div>
          {audienceData.state_level_targeting && (
            <NeuInput
              placeholder="Enter states (comma-separated)"
              value={audienceData.state_targeting_values || ''}
              onChange={(e) => onAudienceDataChange("state_targeting_values", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="city-targeting"
              checked={audienceData.city_level_targeting}
              onCheckedChange={(checked) =>
                onAudienceDataChange("city_level_targeting", checked)
              }
            />
            <Label htmlFor="city-targeting">City-Level Targeting</Label>
          </div>
          {audienceData.city_level_targeting && (
            <NeuInput
              placeholder="Enter cities (comma-separated)"
              value={audienceData.city_targeting_values || ''}
              onChange={(e) => onAudienceDataChange("city_targeting_values", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="pincode-targeting"
              checked={audienceData.pincode_level_targeting}
              onCheckedChange={(checked) =>
                onAudienceDataChange("pincode_level_targeting", checked)
              }
            />
            <Label htmlFor="pincode-targeting">Pincode-Level Targeting</Label>
          </div>
          {audienceData.pincode_level_targeting && (
            <NeuInput
              placeholder="Enter pincodes (comma-separated)"
              value={audienceData.pincode_targeting_values || ''}
              onChange={(e) => onAudienceDataChange("pincode_targeting_values", e.target.value)}
            />
          )}
        </div>
      </div>
    </NeuCard>
  );
};
