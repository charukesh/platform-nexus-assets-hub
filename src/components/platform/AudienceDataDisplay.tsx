
import NeuCard from "@/components/NeuCard";
import { Label } from "@/components/ui/label";
import { AudienceData } from "@/types/platform";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface AudienceDataDisplayProps {
  audienceData: AudienceData;
}

export const AudienceDataDisplay = ({ audienceData }: AudienceDataDisplayProps) => {
  const renderTargetingStatus = (available: boolean | undefined, values?: string) => (
    <div className="flex items-center gap-2">
      {available ? (
        <>
          <Check className="text-green-500" size={20} />
          <span>{values || 'Available'}</span>
        </>
      ) : (
        <>
          <X className="text-red-500" size={20} />
          <span>Not Available</span>
        </>
      )}
    </div>
  );

  return (
    <NeuCard>
      <h3 className="text-lg font-bold mb-4">Audience Targeting</h3>
      <div className="space-y-6">
        <div>
          <Label className="block mb-2">Age Targeting</Label>
          {renderTargetingStatus(
            audienceData.age_targeting_available,
            audienceData.age_targeting_values
          )}
        </div>

        <div>
          <Label className="block mb-2">Gender Targeting</Label>
          {renderTargetingStatus(
            audienceData.gender_targeting_available,
            audienceData.gender_targeting_values
          )}
        </div>

        <div>
          <Label className="block mb-2">Location Targeting</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">State Level:</span>
              {renderTargetingStatus(
                audienceData.state_level_targeting,
                audienceData.state_targeting_values
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">City Level:</span>
              {renderTargetingStatus(
                audienceData.city_level_targeting,
                audienceData.city_targeting_values
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">Pincode Level:</span>
              {renderTargetingStatus(
                audienceData.pincode_level_targeting,
                audienceData.pincode_targeting_values
              )}
            </div>
          </div>
        </div>

        {audienceData.interests && audienceData.interests.length > 0 && (
          <div>
            <Label className="block mb-2">Interest Categories</Label>
            <div className="flex flex-wrap gap-2">
              {audienceData.interests.map((interest, index) => (
                <Badge key={index} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {audienceData.platform_specific_targeting && 
         audienceData.platform_specific_targeting.length > 0 && (
          <div>
            <Label className="block mb-2">Platform Specific Targeting</Label>
            <div className="flex flex-wrap gap-2">
              {audienceData.platform_specific_targeting.map((target, index) => (
                <Badge key={index} variant="outline">
                  {target}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </NeuCard>
  );
};
