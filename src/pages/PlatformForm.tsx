
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultiStepForm from "@/components/MultiStepForm";
import { Json } from "@/integrations/supabase/types";

// Industry options
const industries = [
  "Video Streaming", "Food Delivery", "E-commerce", "Social Media", 
  "Ride Sharing", "Travel", "Fintech", "Health & Fitness", "Gaming",
  "News & Media", "Music & Audio", "Retail", "QSR"
];

// Device platforms
const devicePlatforms = ["iOS", "Android", "Web", "Connected TV"];

// Demographics
const ageGroups = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const interestCategories = [
  "Technology", "Fashion", "Sports", "Music", "Food", "Travel", "Gaming", 
  "Fitness", "Beauty", "Home", "Books", "Movies", "Business", "Photography",
  "Arts & Culture", "Outdoors", "Politics", "Science", "Health", "Pets",
  "Family", "Education", "Automotive", "Finance", "Shopping"
];

// Campaign types
const buyTypes = ["CPC", "CPM", "CPA", "CPL", "CPV", "Flat Fee", "Sponsorship"];
const funnelingOptions = ["Performance Led", "Brand Recall", "Call to Action"];
const blockedCategories = [
  "Alcohol", "Tobacco", "Gambling", "Weapons", "Adult Content", 
  "Political", "Religious", "Pharmaceuticals", "Controversial Topics"
];

// Interface for form data structure
interface FormDataType {
  name: string;
  industry: string;
  mau: string;
  dau: string;
  premium_users: number;
  premium_users_display_as_percentage: boolean;
  device_split: {
    ios: number;
    android: number;
  };
  audience_data: {
    supports: {
      age: boolean;
      gender: boolean;
      interests: boolean;
      cities: boolean;
      states: boolean;
      pincodes: boolean;
      realtime: boolean;
    };
    demographic: {
      ageGroups: string[];
      gender: string[];
      interests: string[];
    };
    geographic: {
      cities: string[];
      states: string[];
      regions: string[];
      pincodes: string[];
    };
    realtime: boolean;
  };
  campaign_data: {
    buyTypes: string[];
    funneling: string[];
    innovations: string;
  };
  restrictions: {
    blockedCategories: string[];
    minimumSpend: number;
    didYouKnow: string;
  };
}

// Default form data state
const defaultFormData: FormDataType = {
  name: "",
  industry: "",
  mau: "",
  dau: "",
  premium_users: 0,
  premium_users_display_as_percentage: true,
  device_split: {
    ios: 50,
    android: 50
  },
  audience_data: {
    supports: {
      age: false,
      gender: false,
      interests: false,
      cities: false,
      states: false,
      pincodes: false,
      realtime: false
    },
    demographic: {
      ageGroups: [],
      gender: [],
      interests: []
    },
    geographic: {
      cities: [],
      states: [],
      regions: [],
      pincodes: []
    },
    realtime: false
  },
  campaign_data: {
    buyTypes: [],
    funneling: [],
    innovations: ""
  },
  restrictions: {
    blockedCategories: [],
    minimumSpend: 0,
    didYouKnow: ""
  }
};

// Helper function to safely parse JSON data from Supabase
const parseJsonField = <T extends object>(jsonData: Json | null, defaultValue: T): T => {
  if (!jsonData) return defaultValue;
  
  if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
    return { ...defaultValue, ...jsonData as object } as T;
  }
  
  return defaultValue;
};

const PlatformForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormDataType>(defaultFormData);
  
  // Local state for form inputs
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newPincode, setNewPincode] = useState("");
  
  useEffect(() => {
    if (isEditMode) {
      fetchPlatform();
    }
  }, [id]);

  const fetchPlatform = async () => {
    if (!id) return;
    
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        const audienceData = parseJsonField(data.audience_data, defaultFormData.audience_data);
        // Ensure supports object exists with default values if not present
        if (!audienceData.supports) {
          audienceData.supports = defaultFormData.audience_data.supports;
        }
        
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          mau: data.mau || "",
          dau: data.dau || "",
          premium_users: data.premium_users || 0,
          premium_users_display_as_percentage: data.premium_users_display_as_percentage !== false,
          device_split: parseJsonField(data.device_split, defaultFormData.device_split),
          audience_data: audienceData,
          campaign_data: parseJsonField(data.campaign_data, defaultFormData.campaign_data),
          restrictions: parseJsonField(data.restrictions, defaultFormData.restrictions)
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof FormDataType, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as object,
        [field]: value
      }
    }));
  };

  const handleDemographicChange = (field: keyof FormDataType['audience_data']['demographic'], value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        demographic: {
          ...prev.audience_data.demographic,
          [field]: value
        }
      }
    }));
  };

  const handleGeographicChange = (field: keyof FormDataType['audience_data']['geographic'], value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        geographic: {
          ...prev.audience_data.geographic,
          [field]: value
        }
      }
    }));
  };

  const handleAudienceSupportsChange = (field: keyof FormDataType['audience_data']['supports'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      audience_data: {
        ...prev.audience_data,
        supports: {
          ...prev.audience_data.supports,
          [field]: value
        }
      }
    }));
  };

  const handleCampaignChange = (field: keyof FormDataType['campaign_data'], value: any) => {
    setFormData(prev => ({
      ...prev,
      campaign_data: {
        ...prev.campaign_data,
        [field]: value
      }
    }));
  };

  const handleRestrictionsChange = (field: keyof FormDataType['restrictions'], value: any) => {
    setFormData(prev => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        [field]: value
      }
    }));
  };

  const handleArrayItemAdd = (category: string, subcategory: string, value: string) => {
    if (!value.trim()) return;
    
    if (category === 'audience_data') {
      if (subcategory === 'geographic') {
        let field: string;
        let currentValue: string;
        
        if (value === newCity) {
          field = 'cities';
          currentValue = newCity;
          setNewCity('');
        } else if (value === newState) {
          field = 'states';
          currentValue = newState;
          setNewState('');
        } else if (value === newPincode) {
          field = 'pincodes';
          currentValue = newPincode;
          setNewPincode('');
        } else {
          field = 'regions';
          currentValue = newRegion;
          setNewRegion('');
        }
        
        const currentArray = formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[];
        
        if (!currentArray.includes(currentValue)) {
          handleGeographicChange(field as keyof FormDataType['audience_data']['geographic'], [...currentArray, currentValue]);
        }
      }
    }
  };

  const handleArrayItemRemove = (category: string, subcategory: string, field: string, index: number) => {
    if (category === 'audience_data') {
      if (subcategory === 'demographic') {
        const newArray = [...formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[]];
        newArray.splice(index, 1);
        handleDemographicChange(field as keyof FormDataType['audience_data']['demographic'], newArray);
      } else if (subcategory === 'geographic') {
        const newArray = [...formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[]];
        newArray.splice(index, 1);
        handleGeographicChange(field as keyof FormDataType['audience_data']['geographic'], newArray);
      }
    } else if (category === 'campaign_data') {
      const newArray = [...formData.campaign_data[field as keyof typeof formData.campaign_data] as string[]];
      newArray.splice(index, 1);
      handleCampaignChange(field as keyof FormDataType['campaign_data'], newArray);
    } else if (category === 'restrictions') {
      const newArray = [...formData.restrictions[field as keyof typeof formData.restrictions] as string[]];
      newArray.splice(index, 1);
      handleRestrictionsChange(field as keyof FormDataType['restrictions'], newArray);
    }
  };

  const handleCheckboxToggle = (category: string, field: string, value: string) => {
    if (category === 'audience_data.demographic') {
      const currentArray = formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleDemographicChange(field as keyof FormDataType['audience_data']['demographic'], newArray);
    } else if (category === 'campaign_data') {
      const currentArray = formData.campaign_data[field as keyof typeof formData.campaign_data] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleCampaignChange(field as keyof FormDataType['campaign_data'], newArray);
    } else if (category === 'restrictions') {
      const currentArray = formData.restrictions[field as keyof typeof formData.restrictions] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleRestrictionsChange(field as keyof FormDataType['restrictions'], newArray);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare data for database
      const platformData = {
        name: formData.name,
        industry: formData.industry,
        mau: formData.mau,
        dau: formData.dau,
        premium_users: formData.premium_users,
        premium_users_display_as_percentage: formData.premium_users_display_as_percentage,
        device_split: formData.device_split,
        audience_data: formData.audience_data,
        campaign_data: formData.campaign_data,
        restrictions: formData.restrictions
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing platform
        result = await supabase
          .from('platforms')
          .update(platformData)
          .eq('id', id);
      } else {
        // Insert new platform
        result = await supabase
          .from('platforms')
          .insert(platformData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: isEditMode ? "Platform updated" : "Platform created",
        description: isEditMode 
          ? "Platform has been successfully updated." 
          : "Platform has been successfully created.",
      });
      
      navigate("/platforms");
    } catch (error: any) {
      toast({
        title: "Error saving platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate the basic info step
  const validateBasicInfo = () => {
    if (!formData.name || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Format premium users based on display preference
  const formatPremiumUsers = (value: number, asPercentage: boolean): string => {
    if (asPercentage) {
      return `${value}%`;
    } else {
      // Convert percentage to count in millions based on MAU
      const mauValue = parseFloat(formData.mau.replace(/[^0-9.]/g, ''));
      if (isNaN(mauValue)) return `${value}%`;
      
      const count = (mauValue * value) / 100;
      return count >= 1 ? `${count.toFixed(2)}M` : `${(count * 1000).toFixed(0)}K`;
    }
  };

  // Create the steps for our multistep form
  const formSteps = [
    {
      title: "Basic Information",
      validator: validateBasicInfo,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Platform Name*</Label>
            <Input
              id="platform-name"
              placeholder="Enter platform name"
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry*</Label>
            <Select 
              required
              value={formData.industry}
              onValueChange={(value) => handleChange('industry', value)}
            >
              <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
              <Input
                id="mau"
                placeholder="e.g., 1.2M"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                value={formData.mau}
                onChange={(e) => handleChange('mau', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dau">Daily Active Users (DAU)</Label>
              <Input
                id="dau"
                placeholder="e.g., 500K"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                value={formData.dau}
                onChange={(e) => handleChange('dau', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="premium-users">Premium Users</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Count</span>
                  <Switch
                    checked={formData.premium_users_display_as_percentage}
                    onCheckedChange={(checked) => handleChange('premium_users_display_as_percentage', checked)}
                  />
                  <span className="text-xs text-muted-foreground">Percentage</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.premium_users]}
                  onValueChange={(value) => handleChange('premium_users', value[0])}
                  className="flex-1"
                />
                <span className="w-16 text-center">
                  {formatPremiumUsers(formData.premium_users, formData.premium_users_display_as_percentage)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Device Split (iOS/Android)</Label>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>iOS: {formData.device_split.ios}%</span>
                <span>Android: {formData.device_split.android}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[formData.device_split.ios]}
                onValueChange={(value) => {
                  const ios = value[0];
                  handleNestedChange('device_split', 'ios', ios);
                  handleNestedChange('device_split', 'android', 100 - ios);
                }}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Audience Targeting",
      content: (
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
      )
    },
    {
      title: "Campaign Capabilities",
      content: (
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
      )
    },
    {
      title: "Restrictions & Notes",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Blocked Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {blockedCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`block-${category}`}
                    checked={formData.restrictions.blockedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCheckboxToggle('restrictions', 'blockedCategories', category)}
                  />
                  <label 
                    htmlFor={`block-${category}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Minimum Spend (in USD)</h3>
            <div className="flex items-center space-x-2">
              <Slider
                min={0}
                max={100000}
                step={1000}
                value={[formData.restrictions.minimumSpend]}
                onValueChange={(value) => handleRestrictionsChange('minimumSpend', value[0])}
                className="flex-1"
              />
              <span className="w-24 text-center">
                ${formData.restrictions.minimumSpend.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Additional Notes</h3>
            <Textarea
              id="did-you-know"
              placeholder="Add any additional notes or 'Did You Know' facts about this platform..."
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0 resize-none h-32"
              value={formData.restrictions.didYouKnow}
              onChange={(e) => handleRestrictionsChange('didYouKnow', e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="container py-8">
        <NeuCard className="max-w-4xl mx-auto p-6 border-t-4 border-primary">
          <h1 className="text-2xl font-bold mb-6">
            {isEditMode ? "Edit Platform" : "Add New Platform"}
          </h1>
          
          {fetchLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading platform data...</p>
            </div>
          ) : (
            <MultiStepForm
              steps={formSteps}
              onComplete={handleSubmit}
              onCancel={() => navigate("/platforms")}
              isSubmitting={loading}
            />
          )}
        </NeuCard>
      </div>
    </Layout>
  );
};

export default PlatformForm;
