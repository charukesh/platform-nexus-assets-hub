
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
import { PlusCircle, MinusCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultiStepForm from "@/components/MultiStepForm";

// Industry options
const industries = [
  "Video Streaming", "Food Delivery", "E-commerce", "Social Media", 
  "Ride Sharing", "Travel", "Fintech", "Health & Fitness", "Gaming",
  "News & Media", "Music & Audio", "Retail"
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
const blockedCategories = [
  "Alcohol", "Tobacco", "Gambling", "Weapons", "Adult Content", 
  "Political", "Religious", "Pharmaceuticals", "Controversial Topics"
];

const PlatformForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    mau: "",
    dau: "",
    premium_users: 0,
    device_split: {
      ios: 50,
      android: 50
    },
    audience_data: {
      demographic: {
        ageGroups: [] as string[],
        gender: [] as string[],
        interests: [] as string[]
      },
      geographic: {
        cities: [] as string[],
        states: [] as string[],
        regions: [] as string[]
      }
    },
    campaign_data: {
      buyTypes: [] as string[],
      funneling: "",
      innovations: ""
    },
    restrictions: {
      blockedCategories: [] as string[],
      minimumSpend: 0,
      didYouKnow: ""
    }
  });
  
  // Local state for form inputs
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newRegion, setNewRegion] = useState("");
  
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
        // Initialize with defaults for nested objects if they don't exist
        const audience_data = data.audience_data || {
          demographic: { ageGroups: [], gender: [], interests: [] },
          geographic: { cities: [], states: [], regions: [] }
        };
        
        const campaign_data = data.campaign_data || {
          buyTypes: [],
          funneling: "",
          innovations: ""
        };
        
        const restrictions = data.restrictions || {
          blockedCategories: [],
          minimumSpend: 0,
          didYouKnow: ""
        };
        
        const device_split = data.device_split || { ios: 50, android: 50 };
        
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          mau: data.mau || "",
          dau: data.dau || "",
          premium_users: data.premium_users || 0,
          device_split,
          audience_data,
          campaign_data,
          restrictions
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

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleDemographicChange = (field: string, value: any) => {
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

  const handleGeographicChange = (field: string, value: any) => {
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

  const handleCampaignChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      campaign_data: {
        ...prev.campaign_data,
        [field]: value
      }
    }));
  };

  const handleRestrictionsChange = (field: string, value: any) => {
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
        const field = value === newCity ? 'cities' : value === newState ? 'states' : 'regions';
        const currentArray = formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[];
        
        if (!currentArray.includes(value)) {
          handleGeographicChange(field, [...currentArray, value]);
        }
        
        if (field === 'cities') setNewCity('');
        else if (field === 'states') setNewState('');
        else setNewRegion('');
      }
    }
  };

  const handleArrayItemRemove = (category: string, subcategory: string, field: string, index: number) => {
    if (category === 'audience_data') {
      if (subcategory === 'demographic') {
        const newArray = [...formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[]];
        newArray.splice(index, 1);
        handleDemographicChange(field, newArray);
      } else if (subcategory === 'geographic') {
        const newArray = [...formData.audience_data.geographic[field as keyof typeof formData.audience_data.geographic] as string[]];
        newArray.splice(index, 1);
        handleGeographicChange(field, newArray);
      }
    } else if (category === 'campaign_data') {
      const newArray = [...formData.campaign_data[field as keyof typeof formData.campaign_data] as string[]];
      newArray.splice(index, 1);
      handleCampaignChange(field, newArray);
    } else if (category === 'restrictions') {
      const newArray = [...formData.restrictions[field as keyof typeof formData.restrictions] as string[]];
      newArray.splice(index, 1);
      handleRestrictionsChange(field, newArray);
    }
  };

  const handleCheckboxToggle = (category: string, field: string, value: string) => {
    if (category === 'audience_data.demographic') {
      const currentArray = formData.audience_data.demographic[field as keyof typeof formData.audience_data.demographic] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleDemographicChange(field, newArray);
    } else if (category === 'campaign_data') {
      const currentArray = formData.campaign_data[field as keyof typeof formData.campaign_data] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleCampaignChange(field, newArray);
    } else if (category === 'restrictions') {
      const currentArray = formData.restrictions[field as keyof typeof formData.restrictions] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      handleRestrictionsChange(field, newArray);
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
              <Label htmlFor="premium-users">Premium Users (%)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.premium_users]}
                  onValueChange={(value) => handleChange('premium_users', value[0])}
                  className="flex-1"
                />
                <span className="w-10 text-center">{formData.premium_users}%</span>
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
            <h3 className="text-lg font-medium mb-3">Demographic Targeting</h3>
            
            <div className="space-y-4">
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
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Geographic Targeting</h3>
            
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Campaign Management",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Buy Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {buyTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`buy-${type}`}
                    checked={formData.campaign_data.buyTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleCampaignChange('buyTypes', [...formData.campaign_data.buyTypes, type]);
                      } else {
                        handleCampaignChange(
                          'buyTypes', 
                          formData.campaign_data.buyTypes.filter(t => t !== type)
                        );
                      }
                    }}
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
          
          <div className="space-y-2">
            <Label htmlFor="funneling">Campaign Funneling Information</Label>
            <Textarea
              id="funneling"
              placeholder="Enter information about campaign funneling..."
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
              value={formData.campaign_data.funneling}
              onChange={(e) => handleCampaignChange('funneling', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="innovations">Innovations & Gamification</Label>
            <Textarea
              id="innovations"
              placeholder="Enter information about innovations and gamification opportunities..."
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
              value={formData.campaign_data.innovations}
              onChange={(e) => handleCampaignChange('innovations', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      title: "Restrictions",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Blocked Categories</h3>
            <div className="border p-3 rounded neu-pressed max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {blockedCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`block-${category}`}
                      checked={formData.restrictions.blockedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleRestrictionsChange('blockedCategories', [...formData.restrictions.blockedCategories, category]);
                        } else {
                          handleRestrictionsChange(
                            'blockedCategories', 
                            formData.restrictions.blockedCategories.filter(c => c !== category)
                          );
                        }
                      }}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minimumSpend">Minimum Spend ($)</Label>
            <Input
              id="minimumSpend"
              type="number"
              min="0"
              placeholder="Minimum campaign spend"
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
              value={formData.restrictions.minimumSpend}
              onChange={(e) => handleRestrictionsChange('minimumSpend', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="didYouKnow">Did You Know</Label>
            <Textarea
              id="didYouKnow"
              placeholder="Enter interesting facts or important restrictions note..."
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
              value={formData.restrictions.didYouKnow}
              onChange={(e) => handleRestrictionsChange('didYouKnow', e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

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
            <p className="text-muted-foreground mt-1">Configure platform details and targeting capabilities</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto">
          <NeuCard>
            <MultiStepForm
              steps={formSteps}
              onComplete={handleSubmit}
              onCancel={() => navigate("/platforms")}
              isSubmitting={loading}
            />
          </NeuCard>
        </div>
      </div>
    </Layout>
  );
};

export default PlatformForm;
