
import React from "react";
import { CampaignData } from "@/types/campaign";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Industries, 
  AgeGroups, 
  Genders, 
  Interests, 
  TierLevels, 
  Cities, 
  States, 
  Objectives, 
  AssetCategories,
  PlatformTypes
} from "@/utils/campaignUtils";
import { Checkbox } from "@/components/ui/checkbox";
import MultiSelect from "@/components/ui/multi-select";
import DurationSelector from "./DurationSelector";

interface CampaignRequirementsProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

const CampaignRequirements: React.FC<CampaignRequirementsProps> = ({
  data,
  updateData,
}) => {
  const handleMultiSelect = (field: keyof CampaignData, value: string[]) => {
    updateData({ [field]: value });
  };

  const handleDemographicChange = (field: keyof CampaignData["demographics"], value: string[]) => {
    updateData({
      demographics: {
        ...data.demographics,
        [field]: value
      }
    });
  };

  const handleGeographicChange = (field: keyof CampaignData["geographics"], value: string[]) => {
    updateData({
      geographics: {
        ...data.geographics,
        [field]: value
      }
    });
  };

  const handleDuration = (days: number) => {
    updateData({ durationDays: days });
  };

  return (
    <div className="space-y-6">
      {/* Industry */}
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select 
          value={data.industry} 
          onValueChange={(value) => updateData({ industry: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {Industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Demographics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Demographics</h3>
        
        <div>
          <Label>Age Groups</Label>
          <MultiSelect
            options={AgeGroups.map((age) => ({ label: age, value: age }))}
            selected={data.demographics.ageGroups}
            onChange={(values) => handleDemographicChange("ageGroups", values)}
            placeholder="Select age groups"
          />
        </div>
        
        <div>
          <Label>Gender</Label>
          <MultiSelect
            options={Genders.map((gender) => ({ label: gender, value: gender }))}
            selected={data.demographics.gender}
            onChange={(values) => handleDemographicChange("gender", values)}
            placeholder="Select genders"
          />
        </div>
        
        <div>
          <Label>Interests</Label>
          <MultiSelect
            options={Interests.map((interest) => ({ label: interest, value: interest }))}
            selected={data.demographics.interests}
            onChange={(values) => handleDemographicChange("interests", values)}
            placeholder="Select interests"
          />
        </div>
      </div>

      {/* Geographics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Geographics</h3>
        
        <div>
          <Label>Tier Levels</Label>
          <MultiSelect
            options={TierLevels.map((tier) => ({ label: tier, value: tier }))}
            selected={data.geographics.tierLevels}
            onChange={(values) => handleGeographicChange("tierLevels", values)}
            placeholder="Select tier levels"
          />
        </div>
        
        <div>
          <Label>Cities</Label>
          <MultiSelect
            options={Cities.map((city) => ({ label: city, value: city }))}
            selected={data.geographics.cities}
            onChange={(values) => handleGeographicChange("cities", values)}
            placeholder="Select cities"
          />
        </div>
        
        <div>
          <Label>States</Label>
          <MultiSelect
            options={States.map((state) => ({ label: state, value: state }))}
            selected={data.geographics.states}
            onChange={(values) => handleGeographicChange("states", values)}
            placeholder="Select states"
          />
        </div>
      </div>

      {/* Campaign Objectives */}
      <div>
        <Label>Campaign Objectives</Label>
        <MultiSelect
          options={Objectives.map((objective) => ({ label: objective, value: objective }))}
          selected={data.objectives}
          onChange={(values) => handleMultiSelect("objectives", values)}
          placeholder="Select campaign objectives"
        />
      </div>

      {/* Campaign Duration */}
      <div>
        <Label>Campaign Duration (days)</Label>
        <DurationSelector 
          duration={data.durationDays}
          onChange={handleDuration}
        />
      </div>

      {/* Campaign Budget */}
      <div>
        <Label htmlFor="budget">Budget (INR)</Label>
        <Input
          id="budget"
          type="number"
          min="0"
          value={data.budget || ""}
          onChange={(e) => updateData({ budget: Number(e.target.value) })}
          placeholder="Enter campaign budget"
        />
      </div>

      {/* Asset Categories */}
      <div>
        <Label>Asset Categories</Label>
        <MultiSelect
          options={AssetCategories.map((category) => ({ label: category, value: category }))}
          selected={data.assetCategories}
          onChange={(values) => handleMultiSelect("assetCategories", values)}
          placeholder="Select asset categories"
        />
      </div>

      {/* Platform Types */}
      <div>
        <Label>Platform Types</Label>
        <MultiSelect
          options={PlatformTypes.map((type) => ({ label: type, value: type }))}
          selected={data.platformTypes || []}
          onChange={(values) => handleMultiSelect("platformTypes", values)}
          placeholder="Select platform types"
        />
      </div>

      {/* Premium Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="premium-only"
          checked={data.premiumOnly}
          onCheckedChange={(checked) => updateData({ premiumOnly: Boolean(checked) })}
        />
        <Label htmlFor="premium-only">Premium Platforms Only</Label>
      </div>
    </div>
  );
};

export default CampaignRequirements;
