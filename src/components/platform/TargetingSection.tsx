
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  AudienceData, 
  GENDER_OPTIONS,
  GEOGRAPHY_OPTIONS,
  COHORT_OPTIONS 
} from "@/types/platform";
import CommaSeparatedInput from "@/components/CommaSeparatedInput";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface TargetingSectionProps {
  audienceData: AudienceData;
  onAudienceDataChange: (field: string, value: any) => void;
}

export const TargetingSection: React.FC<TargetingSectionProps> = ({
  audienceData,
  onAudienceDataChange,
}) => {
  const handleMultiSelectChange = (field: string, value: string) => {
    const currentValues = audienceData[field as keyof AudienceData] as string[] || [];
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

    onAudienceDataChange(field, newValues);
  };

  const handleAgeRangeChange = (min: number, max: number) => {
    onAudienceDataChange('age_targeting_values', { min, max });
  };

  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Targeting Capabilities</h2>
      
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="item-1" className="border-b">
          <AccordionTrigger className="text-lg font-medium">Geographic Targeting</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div>
              <Label htmlFor="geography_presence" className="block mb-2">Geography Presence</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GEOGRAPHY_OPTIONS.map((geo) => (
                  <div 
                    key={geo}
                    onClick={() => handleMultiSelectChange('geography_presence', geo)}
                    className={`
                      cursor-pointer rounded-md p-2 border border-gray-300
                      ${(audienceData.geography_presence || []).includes(geo) 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-white hover:bg-gray-50'}
                    `}
                  >
                    {geo}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="state_targeting">State Level Targeting</Label>
                <Switch
                  id="state_targeting"
                  checked={audienceData.state_level_targeting || false}
                  onCheckedChange={(checked) => onAudienceDataChange('state_level_targeting', checked)}
                />
              </div>
              
              {audienceData.state_level_targeting && (
                <CommaSeparatedInput
                  placeholder="Enter states separated by commas"
                  value={Array.isArray(audienceData.state_targeting_values) 
                    ? audienceData.state_targeting_values.join(', ') 
                    : audienceData.state_targeting_values || ''}
                  onChange={(value) => onAudienceDataChange('state_targeting_values', value.split(',').map(s => s.trim()))}
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="city_targeting">City Level Targeting</Label>
                <Switch
                  id="city_targeting"
                  checked={audienceData.city_level_targeting || false}
                  onCheckedChange={(checked) => onAudienceDataChange('city_level_targeting', checked)}
                />
              </div>
              
              {audienceData.city_level_targeting && (
                <CommaSeparatedInput
                  placeholder="Enter cities separated by commas"
                  value={Array.isArray(audienceData.city_targeting_values) 
                    ? audienceData.city_targeting_values.join(', ') 
                    : audienceData.city_targeting_values || ''}
                  onChange={(value) => onAudienceDataChange('city_targeting_values', value.split(',').map(s => s.trim()))}
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="pincode_targeting">Pincode Level Targeting</Label>
                <Switch
                  id="pincode_targeting"
                  checked={audienceData.pincode_level_targeting || false}
                  onCheckedChange={(checked) => onAudienceDataChange('pincode_level_targeting', checked)}
                />
              </div>
              
              {audienceData.pincode_level_targeting && (
                <CommaSeparatedInput
                  placeholder="Enter pincodes separated by commas"
                  value={Array.isArray(audienceData.pincode_targeting_values) 
                    ? audienceData.pincode_targeting_values.join(', ') 
                    : audienceData.pincode_targeting_values || ''}
                  onChange={(value) => onAudienceDataChange('pincode_targeting_values', value.split(',').map(s => s.trim()))}
                />
              )}
            </div>

            <div>
              <Label htmlFor="cohorts" className="block mb-2">Cohorts</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COHORT_OPTIONS.map((cohort) => (
                  <div 
                    key={cohort}
                    onClick={() => handleMultiSelectChange('cohorts', cohort)}
                    className={`
                      cursor-pointer rounded-md p-2 border border-gray-300
                      ${(audienceData.cohorts || []).includes(cohort) 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-white hover:bg-gray-50'}
                    `}
                  >
                    {cohort}
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-b">
          <AccordionTrigger className="text-lg font-medium">Demographic Targeting</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="age_targeting">Age Targeting</Label>
                <Switch
                  id="age_targeting"
                  checked={audienceData.age_targeting_available || false}
                  onCheckedChange={(checked) => onAudienceDataChange('age_targeting_available', checked)}
                />
              </div>
              
              {audienceData.age_targeting_available && (
                <div className="space-y-4">
                  <Label className="block">Age Range: {audienceData.age_targeting_values?.min || 13} - {audienceData.age_targeting_values?.max || 65}+</Label>
                  <div className="px-2">
                    <Slider
                      min={13}
                      max={65}
                      step={1}
                      defaultValue={[audienceData.age_targeting_values?.min || 13, audienceData.age_targeting_values?.max || 65]}
                      onValueChange={(value) => handleAgeRangeChange(value[0], value[1])}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="gender_targeting">Gender Targeting</Label>
                <Switch
                  id="gender_targeting"
                  checked={audienceData.gender_targeting_available || false}
                  onCheckedChange={(checked) => onAudienceDataChange('gender_targeting_available', checked)}
                />
              </div>
              
              {audienceData.gender_targeting_available && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {GENDER_OPTIONS.map((gender) => (
                    <div 
                      key={gender}
                      onClick={() => handleMultiSelectChange('gender_targeting_values', gender)}
                      className={`
                        cursor-pointer rounded-md p-2 border border-gray-300
                        ${(Array.isArray(audienceData.gender_targeting_values) 
                          ? audienceData.gender_targeting_values.includes(gender)
                          : audienceData.gender_targeting_values === gender)
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-white hover:bg-gray-50'}
                      `}
                    >
                      {gender}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="interests" className="block mb-2">Interests</Label>
              <CommaSeparatedInput
                placeholder="Enter interests separated by commas"
                value={(audienceData.interests || []).join(', ')}
                onChange={(value) => onAudienceDataChange('interests', value.split(',').map(s => s.trim()))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </NeuCard>
  );
};
