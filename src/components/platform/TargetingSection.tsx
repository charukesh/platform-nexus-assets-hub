
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import NeuCard from "@/components/NeuCard";

interface TargetingSectionProps {
  audienceData: any;
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
      </div>
    </NeuCard>
  );
};
