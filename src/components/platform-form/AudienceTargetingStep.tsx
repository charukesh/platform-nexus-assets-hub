
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import NeuButton from "@/components/NeuButton";
import { MinusCircle } from "lucide-react";
import { FormDataType, ageGroups, genderOptions, interestCategories } from "@/utils/platformFormUtils";

interface AudienceTargetingStepProps {
  formData: FormDataType;
  handleAudienceSupportsChange: (field: keyof FormDataType['audience_data']['supports'], value: boolean) => void;
  handleDemographicChange: (field: keyof FormDataType['audience_data']['demographic'], value: any) => void;
  handleGeographicChange: (field: keyof FormDataType['audience_data']['geographic'], value: any) => void;
  handleArrayItemAdd: (category: string, subcategory: string, value: string) => void;
  handleArrayItemRemove: (category: string, subcategory: string, field: string, index: number) => void;
}

const AudienceTargetingStep: React.FC<AudienceTargetingStepProps> = ({
  formData,
  handleAudienceSupportsChange,
  handleDemographicChange,
  handleGeographicChange,
  handleArrayItemAdd,
  handleArrayItemRemove
}) => {
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newPincode, setNewPincode] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Demographic Targeting Support</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-age"
              checked={formData.audience_data.supports.age}
              onCheckedChange={(checked) => handleAudienceSupportsChange('age', !!checked)}
            />
            <Label htmlFor="supports-age" className="cursor-pointer">Age Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-gender"
              checked={formData.audience_data.supports.gender}
              onCheckedChange={(checked) => handleAudienceSupportsChange('gender', !!checked)}
            />
            <Label htmlFor="supports-gender" className="cursor-pointer">Gender Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-interests"
              checked={formData.audience_data.supports.interests}
              onCheckedChange={(checked) => handleAudienceSupportsChange('interests', !!checked)}
            />
            <Label htmlFor="supports-interests" className="cursor-pointer">Interest Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-cities"
              checked={formData.audience_data.supports.cities}
              onCheckedChange={(checked) => handleAudienceSupportsChange('cities', !!checked)}
            />
            <Label htmlFor="supports-cities" className="cursor-pointer">City Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-states"
              checked={formData.audience_data.supports.states}
              onCheckedChange={(checked) => handleAudienceSupportsChange('states', !!checked)}
            />
            <Label htmlFor="supports-states" className="cursor-pointer">State Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-pincodes"
              checked={formData.audience_data.supports.pincodes}
              onCheckedChange={(checked) => handleAudienceSupportsChange('pincodes', !!checked)}
            />
            <Label htmlFor="supports-pincodes" className="cursor-pointer">Pincode Targeting</Label>
          </div>
          
          <div className="flex items-center space-x-2 neu-flat p-3 rounded">
            <Checkbox 
              id="supports-realtime"
              checked={formData.audience_data.supports.realtime}
              onCheckedChange={(checked) => handleAudienceSupportsChange('realtime', !!checked)}
            />
            <Label htmlFor="supports-realtime" className="cursor-pointer">Real-time Targeting</Label>
          </div>
        </div>
        
        <div className="space-y-4">
          {formData.audience_data.supports.age && (
            <div>
              <Label className="mb-2 block">Age Groups</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ageGroups.map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`age-${age}`}
                      checked={formData.audience_data.demographic.ageGroups.includes(age)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDemographicChange('ageGroups', [...formData.audience_data.demographic.ageGroups, age]);
                        } else {
                          handleDemographicChange(
                            'ageGroups', 
                            formData.audience_data.demographic.ageGroups.filter(a => a !== age)
                          );
                        }
                      }}
                    />
                    <label 
                      htmlFor={`age-${age}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {age}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formData.audience_data.supports.gender && (
            <div>
              <Label className="mb-2 block">Gender</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {genderOptions.map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`gender-${gender}`}
                      checked={formData.audience_data.demographic.gender.includes(gender)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDemographicChange('gender', [...formData.audience_data.demographic.gender, gender]);
                        } else {
                          handleDemographicChange(
                            'gender', 
                            formData.audience_data.demographic.gender.filter(g => g !== gender)
                          );
                        }
                      }}
                    />
                    <label 
                      htmlFor={`gender-${gender}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {gender}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formData.audience_data.supports.interests && (
            <div>
              <Label className="mb-2 block">Interests</Label>
              <div className="border p-3 rounded neu-pressed max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interestCategories.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`interest-${interest}`}
                        checked={formData.audience_data.demographic.interests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDemographicChange('interests', [...formData.audience_data.demographic.interests, interest]);
                          } else {
                            handleDemographicChange(
                              'interests', 
                              formData.audience_data.demographic.interests.filter(i => i !== interest)
                            );
                          }
                        }}
                      />
                      <label 
                        htmlFor={`interest-${interest}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Geographic Targeting</h3>
        
        <div className="space-y-4">
          {formData.audience_data.supports.cities && (
            <div>
              <Label htmlFor="cities" className="mb-2 block">Cities</Label>
              <div className="flex mb-2">
                <Input
                  id="cities"
                  placeholder="Add city name"
                  className="bg-white border-none neu-pressed focus-visible:ring-offset-0 mr-2"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayItemAdd('audience_data', 'geographic', newCity);
                    }
                  }}
                />
                <NeuButton 
                  type="button" 
                  onClick={() => handleArrayItemAdd('audience_data', 'geographic', newCity)}
                >
                  Add
                </NeuButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.audience_data.geographic.cities.map((city, index) => (
                  <div 
                    key={`city-${index}`} 
                    className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm"
                  >
                    <span>{city}</span>
                    <button 
                      type="button"
                      onClick={() => handleArrayItemRemove('audience_data', 'geographic', 'cities', index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formData.audience_data.supports.states && (
            <div>
              <Label htmlFor="states" className="mb-2 block">States</Label>
              <div className="flex mb-2">
                <Input
                  id="states"
                  placeholder="Add state name"
                  className="bg-white border-none neu-pressed focus-visible:ring-offset-0 mr-2"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayItemAdd('audience_data', 'geographic', newState);
                    }
                  }}
                />
                <NeuButton 
                  type="button" 
                  onClick={() => handleArrayItemAdd('audience_data', 'geographic', newState)}
                >
                  Add
                </NeuButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.audience_data.geographic.states.map((state, index) => (
                  <div 
                    key={`state-${index}`} 
                    className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm"
                  >
                    <span>{state}</span>
                    <button 
                      type="button"
                      onClick={() => handleArrayItemRemove('audience_data', 'geographic', 'states', index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="regions" className="mb-2 block">Regions</Label>
            <div className="flex mb-2">
              <Input
                id="regions"
                placeholder="Add region name"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0 mr-2"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayItemAdd('audience_data', 'geographic', newRegion);
                  }
                }}
              />
              <NeuButton 
                type="button" 
                onClick={() => handleArrayItemAdd('audience_data', 'geographic', newRegion)}
              >
                Add
              </NeuButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.audience_data.geographic.regions.map((region, index) => (
                <div 
                  key={`region-${index}`} 
                  className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm"
                >
                  <span>{region}</span>
                  <button 
                    type="button"
                    onClick={() => handleArrayItemRemove('audience_data', 'geographic', 'regions', index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <MinusCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {formData.audience_data.supports.pincodes && (
            <div>
              <Label htmlFor="pincodes" className="mb-2 block">Pincodes</Label>
              <div className="flex mb-2">
                <Input
                  id="pincodes"
                  placeholder="Add pincode"
                  className="bg-white border-none neu-pressed focus-visible:ring-offset-0 mr-2"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayItemAdd('audience_data', 'geographic', newPincode);
                    }
                  }}
                />
                <NeuButton 
                  type="button" 
                  onClick={() => handleArrayItemAdd('audience_data', 'geographic', newPincode)}
                >
                  Add
                </NeuButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.audience_data.geographic.pincodes.map((pincode, index) => (
                  <div 
                    key={`pincode-${index}`} 
                    className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm"
                  >
                    <span>{pincode}</span>
                    <button 
                      type="button"
                      onClick={() => handleArrayItemRemove('audience_data', 'geographic', 'pincodes', index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AudienceTargetingStep, type AudienceTargetingStepProps };
