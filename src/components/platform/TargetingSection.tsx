
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import NeuCard from "@/components/NeuCard";
import { AudienceData } from "@/types/platform";
import CommaSeparatedInput from "@/components/CommaSeparatedInput";

interface TargetingSectionProps {
  audienceData: AudienceData;
  onAudienceDataChange: (field: string, value: any) => void;
}

export const TargetingSection = ({
  audienceData,
  onAudienceDataChange,
}: TargetingSectionProps) => {
  // Helper function to convert arrays to comma-separated strings
  const getStringFromArray = (value: string[] | string | undefined): string => {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    return value;
  };

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
            <CommaSeparatedInput
              placeholder="Enter age ranges (e.g., 18-24, 25-34)"
              value={getStringFromArray(audienceData.age_targeting_values)}
              onChange={(value) => onAudienceDataChange("age_targeting_values", value)}
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
            <CommaSeparatedInput
              placeholder="Enter gender options (e.g., Male, Female, Non-binary)"
              value={getStringFromArray(audienceData.gender_targeting_values)}
              onChange={(value) => onAudienceDataChange("gender_targeting_values", value)}
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
            <CommaSeparatedInput
              placeholder="Enter states (e.g., Maharashtra, Karnataka, Tamil Nadu)"
              value={getStringFromArray(audienceData.state_targeting_values)}
              onChange={(value) => onAudienceDataChange("state_targeting_values", value)}
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
            <CommaSeparatedInput
              placeholder="Enter cities (e.g., Mumbai, Bangalore, Delhi)"
              value={getStringFromArray(audienceData.city_targeting_values)}
              onChange={(value) => onAudienceDataChange("city_targeting_values", value)}
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
            <CommaSeparatedInput
              placeholder="Enter pincodes (e.g., 400001, 560001, 110001)"
              value={getStringFromArray(audienceData.pincode_targeting_values)}
              onChange={(value) => onAudienceDataChange("pincode_targeting_values", value)}
            />
          )}
        </div>
      </div>
    </NeuCard>
  );
};
