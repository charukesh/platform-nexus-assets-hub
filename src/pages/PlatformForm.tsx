
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Type definitions for structured JSON data
interface DeviceSplit {
  ios: number;
  android: number;
}

interface DemographicData {
  ageGroups: string[];
  gender: string[];
  interests: string[];
}

interface GeographicData {
  cities: string[];
  states: string[];
  regions: string[];
}

interface AudienceData {
  demographic: DemographicData;
  geographic: GeographicData;
}

interface CampaignData {
  funneling: string;
  buyTypes: string[];
  innovations: string;
}

interface Restrictions {
  blockedCategories: string[];
  minimumSpend: number;
  didYouKnow: string;
}

// Constants
const industryOptions = [
  "Social Media",
  "Entertainment",
  "Music Streaming",
  "Video Streaming",
  "Gaming",
  "E-commerce",
  "News & Media",
  "Travel",
  "Food & Delivery",
  "Finance & Banking",
  "Education",
  "Healthcare",
];

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];
const genderOptions = ["Male", "Female", "Others"];
const interestOptions = [
  "Technology",
  "Fashion",
  "Sports",
  "Food",
  "Travel",
  "Music",
  "Movies",
  "Gaming",
  "Health & Fitness",
  "Home & Garden",
  "Business",
  "Arts & Culture",
];

const locationOptions = {
  cities: ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Miami", "Seattle"],
  states: ["California", "New York", "Texas", "Florida", "Illinois", "Washington"],
  regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Northwest"],
};

const buyTypes = ["CPM", "CPC", "CPA", "CPD", "CPE", "CPL", "CPI", "CPV"];

const blockedCategories = [
  "Alcohol",
  "Tobacco",
  "Gambling",
  "Adult Content",
  "Weapons",
  "Political Content",
  "Religious Content",
  "Controversial Topics",
];

// Default values for structured data
const defaultDeviceSplit: DeviceSplit = { ios: 50, android: 50 };
const defaultDemographic: DemographicData = { ageGroups: [], gender: [], interests: [] };
const defaultGeographic: GeographicData = { cities: [], states: [], regions: [] };
const defaultAudienceData: AudienceData = { demographic: defaultDemographic, geographic: defaultGeographic };
const defaultCampaignData: CampaignData = { funneling: "", buyTypes: [], innovations: "" };
const defaultRestrictions: Restrictions = { blockedCategories: [], minimumSpend: 0, didYouKnow: "" };

const PlatformForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    premium_users: 0,
    mau: "",
    dau: "",
    ios_percentage: 50,
    android_percentage: 50,
    audience_data: defaultAudienceData,
    campaign_data: defaultCampaignData,
    restrictions: defaultRestrictions
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

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
        // Parse and safely handle JSON data from database
        const deviceSplit = parseJsonField<DeviceSplit>(data.device_split, defaultDeviceSplit);
        const audienceData = parseJsonField<AudienceData>(data.audience_data, defaultAudienceData);
        const campaignData = parseJsonField<CampaignData>(data.campaign_data, defaultCampaignData);
        const restrictionsData = parseJsonField<Restrictions>(data.restrictions, defaultRestrictions);
        
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          premium_users: data.premium_users || 0,
          mau: data.mau || "",
          dau: data.dau || "",
          ios_percentage: deviceSplit.ios,
          android_percentage: deviceSplit.android,
          audience_data: audienceData,
          campaign_data: campaignData,
          restrictions: restrictionsData
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

  // Helper function to safely parse JSON fields with type checking
  function parseJsonField<T>(jsonField: Json | null, defaultValue: T): T {
    if (!jsonField) return defaultValue;
    
    try {
      if (typeof jsonField === 'object') {
        // Return the object as T, ensuring it has the necessary properties
        return { ...defaultValue, ...jsonField as T };
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (group: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [group]: {
        ...(prev[group as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleDeeplyNestedChange = (group: string, subgroup: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [group]: {
        ...(prev[group as keyof typeof prev] as any),
        [subgroup]: {
          ...((prev[group as keyof typeof prev] as any)[subgroup]),
          [field]: value
        }
      }
    }));
  };

  // Fix checkbox handling to use boolean properly 
  const handleMultiSelectChange = (group: string, subgroup: string, field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const prevGroup = prev[group as keyof typeof prev] as Record<string, any>;
      const prevSubgroup = prevGroup[subgroup] as Record<string, any>;
      const currentValues = prevSubgroup[field] as string[];
      
      let newValues;
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [group]: {
          ...prevGroup,
          [subgroup]: {
            ...prevSubgroup,
            [field]: newValues
          }
        }
      };
    });
  };

  // Fix checkbox handling for top-level arrays
  const handleArrayChange = (group: string, field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const prevGroup = prev[group as keyof typeof prev] as Record<string, any>;
      const currentValues = prevGroup[field] as string[];
      
      let newValues;
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [group]: {
          ...prevGroup,
          [field]: newValues
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for database
      const platformData = {
        name: formData.name,
        industry: formData.industry,
        premium_users: formData.premium_users,
        mau: formData.mau,
        dau: formData.dau,
        device_split: {
          ios: formData.ios_percentage,
          android: formData.android_percentage
        },
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
      
      navigate("/");
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

  if (fetchLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{isEditMode ? "Edit Platform" : "Add New Platform"}</h1>
            <p className="text-muted-foreground mt-1">Enter detailed information about the platform</p>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-8 neu-flat p-1 w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="general" className="data-[state=active]:neu-pressed">
                General
              </TabsTrigger>
              <TabsTrigger value="audience" className="data-[state=active]:neu-pressed">
                Audience
              </TabsTrigger>
              <TabsTrigger value="campaign" className="data-[state=active]:neu-pressed">
                Campaign
              </TabsTrigger>
              <TabsTrigger value="restrictions" className="data-[state=active]:neu-pressed">
                Restrictions
              </TabsTrigger>
            </TabsList>

            {/* General Information Section */}
            <TabsContent value="general" className="space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">General Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premium-users">Premium Users (%)</Label>
                    <Input
                      id="premium-users"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter percentage"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.premium_users}
                      onChange={(e) => handleChange('premium_users', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-active-users">Monthly Active Users (MAU)</Label>
                    <Input
                      id="monthly-active-users"
                      placeholder="e.g., 1.2M"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.mau}
                      onChange={(e) => handleChange('mau', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily-active-users">Daily Active Users (DAU)</Label>
                    <Input
                      id="daily-active-users"
                      placeholder="e.g., 500K"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.dau}
                      onChange={(e) => handleChange('dau', e.target.value)}
                    />
                  </div>
                </div>
              </NeuCard>

              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Device Split</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ios-percentage">iOS (%)</Label>
                    <Input
                      id="ios-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter percentage"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.ios_percentage}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleChange('ios_percentage', value);
                        handleChange('android_percentage', 100 - value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="android-percentage">Android (%)</Label>
                    <Input
                      id="android-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter percentage"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.android_percentage}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleChange('android_percentage', value);
                        handleChange('ios_percentage', 100 - value);
                      }}
                    />
                  </div>
                </div>
              </NeuCard>
            </TabsContent>

            {/* Audience Data Section */}
            <TabsContent value="audience" className="space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Demographic Targeting</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Age Groups</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {ageGroups.map((age) => (
                        <div key={age} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`age-${age}`} 
                            checked={formData.audience_data.demographic.ageGroups.includes(age)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'demographic', 'ageGroups', age, checked === true)}
                          />
                          <Label htmlFor={`age-${age}`} className="cursor-pointer text-sm">
                            {age}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Gender</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {genderOptions.map((gender) => (
                        <div key={gender} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`gender-${gender}`}
                            checked={formData.audience_data.demographic.gender.includes(gender)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'demographic', 'gender', gender, checked === true)}
                          />
                          <Label htmlFor={`gender-${gender}`} className="cursor-pointer text-sm">
                            {gender}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Interests</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {interestOptions.map((interest) => (
                        <div key={interest} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`interest-${interest}`}
                            checked={formData.audience_data.demographic.interests.includes(interest)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'demographic', 'interests', interest, checked === true)}
                          />
                          <Label htmlFor={`interest-${interest}`} className="cursor-pointer text-sm">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NeuCard>

              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Geographic Targeting</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Cities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {locationOptions.cities.map((city) => (
                        <div key={city} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`city-${city}`}
                            checked={formData.audience_data.geographic.cities.includes(city)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'geographic', 'cities', city, checked === true)}
                          />
                          <Label htmlFor={`city-${city}`} className="cursor-pointer text-sm">
                            {city}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">States</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {locationOptions.states.map((state) => (
                        <div key={state} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`state-${state}`}
                            checked={formData.audience_data.geographic.states.includes(state)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'geographic', 'states', state, checked === true)}
                          />
                          <Label htmlFor={`state-${state}`} className="cursor-pointer text-sm">
                            {state}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Regions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {locationOptions.regions.map((region) => (
                        <div key={region} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`region-${region}`}
                            checked={formData.audience_data.geographic.regions.includes(region)}
                            onCheckedChange={(checked) => 
                              handleMultiSelectChange('audience_data', 'geographic', 'regions', region, checked === true)}
                          />
                          <Label htmlFor={`region-${region}`} className="cursor-pointer text-sm">
                            {region}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NeuCard>
            </TabsContent>

            {/* Campaign Management Section */}
            <TabsContent value="campaign" className="space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-funneling">Campaign Funneling</Label>
                    <Textarea
                      id="campaign-funneling"
                      placeholder="Describe the campaign funneling process..."
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
                      value={formData.campaign_data.funneling}
                      onChange={(e) => handleNestedChange('campaign_data', 'funneling', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Buy Types</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {buyTypes.map((type) => (
                        <div key={type} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`buy-type-${type}`}
                            checked={formData.campaign_data.buyTypes.includes(type)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('campaign_data', 'buyTypes', type, checked === true)}
                          />
                          <Label htmlFor={`buy-type-${type}`} className="cursor-pointer text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="innovations">Innovations and Gamification</Label>
                    <Textarea
                      id="innovations"
                      placeholder="Describe innovations and gamification features..."
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
                      value={formData.campaign_data.innovations}
                      onChange={(e) => handleNestedChange('campaign_data', 'innovations', e.target.value)}
                    />
                  </div>
                </div>
              </NeuCard>
            </TabsContent>

            {/* Restrictions Section */}
            <TabsContent value="restrictions" className="space-y-6">
              <NeuCard>
                <h2 className="text-xl font-semibold mb-4">Restrictions and Minimums</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Categories Blocked</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {blockedCategories.map((category) => (
                        <div key={category} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={formData.restrictions.blockedCategories.includes(category)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('restrictions', 'blockedCategories', category, checked === true)}
                          />
                          <Label htmlFor={`category-${category}`} className="cursor-pointer text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimum-spend">Minimum Spend per Campaign ($)</Label>
                    <Input
                      id="minimum-spend"
                      type="number"
                      min="0"
                      placeholder="Enter amount"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                      value={formData.restrictions.minimumSpend}
                      onChange={(e) => handleNestedChange('restrictions', 'minimumSpend', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="did-you-know">Did You Know</Label>
                    <Textarea
                      id="did-you-know"
                      placeholder="Add special insights and notes..."
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
                      value={formData.restrictions.didYouKnow}
                      onChange={(e) => handleNestedChange('restrictions', 'didYouKnow', e.target.value)}
                    />
                  </div>
                </div>
              </NeuCard>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-3">
            <NeuButton type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
              Cancel
            </NeuButton>
            <NeuButton type="submit" disabled={loading}>
              {loading ? 
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span> : 
                `Save Platform`
              }
            </NeuButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
