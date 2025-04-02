
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultiStepForm from "@/components/MultiStepForm";
import { Plus, X, MapPin, Users, Globe } from "lucide-react";

// Available industries
const industries = [
  "Food & Beverage",
  "Retail",
  "Travel",
  "Finance",
  "Healthcare",
  "Technology",
  "Entertainment",
  "Education",
  "Transportation",
  "Real Estate"
];

// Common interests for audience targeting
const commonInterests = [
  "Social Media", "Shopping", "Entertainment", "Sports", "Travel", 
  "Food", "Music", "Technology", "Fashion", "Gaming", "Fitness", 
  "Education", "Finance", "Health", "Books", "Movies", "Photography"
];

// Buy types for campaign management
const buyTypes = [
  "CPC (Cost Per Click)",
  "CPM (Cost Per Mille)",
  "CPA (Cost Per Action)",
  "CPL (Cost Per Lead)",
  "CPI (Cost Per Install)",
  "CPV (Cost Per View)",
  "CPCV (Cost Per Completed View)",
  "Flat Fee"
];

// Innovations and gamification options
const innovationOptions = [
  "Playable Ads",
  "AR Experiences",
  "Interactive Polls",
  "Mini-Games",
  "Quizzes",
  "3D Experiences",
  "Swipe Interactions",
  "Augmented Reality",
  "Reward Mechanics",
  "Referral Programs"
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
    premium_users: 0,
    mau: "",
    dau: "",
    device_split: {
      ios: 50,
      android: 50
    }
  });
  
  // Audience data
  const [audienceData, setAudienceData] = useState({
    age_groups: {
      "18-24": 20,
      "25-34": 30,
      "35-44": 25,
      "45-54": 15,
      "55+": 10
    },
    gender_split: {
      male: 50,
      female: 50
    },
    income_brackets: {
      low: 20,
      medium: 50,
      high: 30
    },
    interests: ["Social Media", "Shopping", "Entertainment"]
  });
  
  // Geographic data
  const [geographicData, setGeographicData] = useState({
    cities: [] as string[],
    states: [] as string[],
    regions: [] as string[],
    countries: [] as string[]
  });
  
  // Campaign data
  const [campaignData, setCampaignData] = useState({
    min_budget: 1000,
    avg_cpm: 5.5,
    avg_ctr: 1.2,
    accepted_formats: ["Image", "Video", "Carousel"],
    tracking_available: true,
    funneling: [] as string[],
    buy_types: ["CPM (Cost Per Mille)"],
    innovations: [] as string[]
  });
  
  // Restrictions
  const [restrictions, setRestrictions] = useState({
    restricted_categories: ["Gambling", "Alcohol", "Tobacco"],
    min_age: 13,
    geo_targeting: true,
    requires_approval: true
  });

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
        // Set basic form data
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          premium_users: data.premium_users || 0,
          mau: data.mau || "",
          dau: data.dau || "",
          device_split: data.device_split && typeof data.device_split === 'object' ? 
            {
              ios: (data.device_split as any).ios || 50,
              android: (data.device_split as any).android || 50
            } : 
            { ios: 50, android: 50 }
        });
        
        // Set audience data
        if (data.audience_data && typeof data.audience_data === 'object') {
          const audience = data.audience_data as any;
          setAudienceData({
            age_groups: audience.age_groups || {
              "18-24": 20,
              "25-34": 30,
              "35-44": 25,
              "45-54": 15,
              "55+": 10
            },
            gender_split: audience.gender_split || {
              male: 50,
              female: 50
            },
            income_brackets: audience.income_brackets || {
              low: 20,
              medium: 50,
              high: 30
            },
            interests: audience.interests || ["Social Media", "Shopping", "Entertainment"]
          });
        }
        
        // Set geographic data
        if (data.geographic_data && typeof data.geographic_data === 'object') {
          const geo = data.geographic_data as any;
          setGeographicData({
            cities: geo.cities || [],
            states: geo.states || [],
            regions: geo.regions || [],
            countries: geo.countries || []
          });
        }
        
        // Set campaign data
        if (data.campaign_data && typeof data.campaign_data === 'object') {
          const campaign = data.campaign_data as any;
          setCampaignData({
            min_budget: campaign.min_budget || 1000,
            avg_cpm: campaign.avg_cpm || 5.5,
            avg_ctr: campaign.avg_ctr || 1.2,
            accepted_formats: campaign.accepted_formats || ["Image", "Video", "Carousel"],
            tracking_available: campaign.tracking_available ?? true,
            funneling: campaign.funneling || [],
            buy_types: campaign.buy_types || ["CPM (Cost Per Mille)"],
            innovations: campaign.innovations || []
          });
        }
        
        // Set restrictions
        if (data.restrictions && typeof data.restrictions === 'object') {
          const restrict = data.restrictions as any;
          setRestrictions({
            restricted_categories: restrict.restricted_categories || ["Gambling", "Alcohol", "Tobacco"],
            min_age: restrict.min_age || 13,
            geo_targeting: restrict.geo_targeting ?? true,
            requires_approval: restrict.requires_approval ?? true
          });
        }
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

  const handleBasicInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleDeviceSplitChange = (iosValue: number) => {
    setFormData(prev => ({
      ...prev,
      device_split: {
        ios: iosValue,
        android: 100 - iosValue
      }
    }));
  };
  
  const handleAudienceChange = (section: string, field: string, value: any) => {
    setAudienceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };
  
  const handleAudienceInterestAdd = (interest: string) => {
    if (!audienceData.interests.includes(interest) && interest.trim() !== '') {
      setAudienceData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };
  
  const handleAudienceInterestRemove = (interest: string) => {
    setAudienceData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  // Geographic handlers
  const handleGeoItemAdd = (section: keyof typeof geographicData, item: string) => {
    if (!geographicData[section].includes(item) && item.trim() !== '') {
      setGeographicData(prev => ({
        ...prev,
        [section]: [...prev[section], item]
      }));
    }
  };
  
  const handleGeoItemRemove = (section: keyof typeof geographicData, item: string) => {
    setGeographicData(prev => ({
      ...prev,
      [section]: prev[section].filter(i => i !== item)
    }));
  };
  
  // Campaign handlers
  const handleCampaignChange = (field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCampaignFormatToggle = (format: string) => {
    setCampaignData(prev => {
      const formats = prev.accepted_formats;
      if (formats.includes(format)) {
        return {
          ...prev,
          accepted_formats: formats.filter(f => f !== format)
        };
      } else {
        return {
          ...prev,
          accepted_formats: [...formats, format]
        };
      }
    });
  };
  
  const handleCampaignItemAdd = (section: 'funneling' | 'buy_types' | 'innovations', item: string) => {
    if (!campaignData[section].includes(item) && item.trim() !== '') {
      setCampaignData(prev => ({
        ...prev,
        [section]: [...prev[section], item]
      }));
    }
  };
  
  const handleCampaignItemRemove = (section: 'funneling' | 'buy_types' | 'innovations', item: string) => {
    setCampaignData(prev => ({
      ...prev,
      [section]: prev[section].filter(i => i !== item)
    }));
  };
  
  const handleBuyTypeToggle = (buyType: string) => {
    setCampaignData(prev => {
      const types = prev.buy_types;
      if (types.includes(buyType)) {
        return {
          ...prev,
          buy_types: types.filter(t => t !== buyType)
        };
      } else {
        return {
          ...prev,
          buy_types: [...types, buyType]
        };
      }
    });
  };
  
  const handleInnovationToggle = (innovation: string) => {
    setCampaignData(prev => {
      const innovations = prev.innovations;
      if (innovations.includes(innovation)) {
        return {
          ...prev,
          innovations: innovations.filter(i => i !== innovation)
        };
      } else {
        return {
          ...prev,
          innovations: [...innovations, innovation]
        };
      }
    });
  };
  
  const handleRestrictionChange = (field: string, value: any) => {
    setRestrictions(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleRestrictionCategoryAdd = (category: string) => {
    if (!restrictions.restricted_categories.includes(category) && category.trim() !== '') {
      setRestrictions(prev => ({
        ...prev,
        restricted_categories: [...prev.restricted_categories, category]
      }));
    }
  };
  
  const handleRestrictionCategoryRemove = (category: string) => {
    setRestrictions(prev => ({
      ...prev,
      restricted_categories: prev.restricted_categories.filter(c => c !== category)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare combined data for submission
      const platformData = {
        name: formData.name,
        industry: formData.industry,
        premium_users: formData.premium_users,
        mau: formData.mau,
        dau: formData.dau,
        device_split: formData.device_split,
        audience_data: audienceData,
        geographic_data: geographicData,
        campaign_data: campaignData,
        restrictions: restrictions
      };
      
      // Convert objects to JSON format that Supabase expects
      const supabaseData = {
        ...platformData,
        audience_data: platformData.audience_data as any,
        geographic_data: platformData.geographic_data as any,
        campaign_data: platformData.campaign_data as any,
        device_split: platformData.device_split as any,
        restrictions: platformData.restrictions as any
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing platform
        result = await supabase
          .from('platforms')
          .update(supabaseData)
          .eq('id', id);
      } else {
        // Insert new platform
        result = await supabase
          .from('platforms')
          .insert(supabaseData);
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

  // Validators for each step
  const validateBasicInfo = () => {
    if (!formData.name || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the platform name and industry.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Step 1: Basic platform information
  const BasicInfoStep = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform-name">Platform Name*</Label>
        <Input
          id="platform-name"
          placeholder="Enter platform name"
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
          value={formData.name}
          onChange={(e) => handleBasicInfoChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry*</Label>
        <Select 
          required
          value={formData.industry}
          onValueChange={(value) => handleBasicInfoChange('industry', value)}
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

      <div className="space-y-2">
        <Label htmlFor="premium-users">Premium Users</Label>
        <Input
          id="premium-users"
          type="number"
          min="0"
          placeholder="Number of premium users"
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
          value={formData.premium_users}
          onChange={(e) => handleBasicInfoChange('premium_users', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
          <Input
            id="mau"
            placeholder="e.g., 1.2M"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={formData.mau}
            onChange={(e) => handleBasicInfoChange('mau', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dau">Daily Active Users (DAU)</Label>
          <Input
            id="dau"
            placeholder="e.g., 250K"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={formData.dau}
            onChange={(e) => handleBasicInfoChange('dau', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Device Split (iOS vs Android)</Label>
        <div className="space-y-4">
          <Slider
            defaultValue={[formData.device_split.ios]}
            max={100}
            step={1}
            value={[formData.device_split.ios]}
            onValueChange={(values) => handleDeviceSplitChange(values[0])}
          />
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">iOS:</span> {formData.device_split.ios}%
            </div>
            <div>
              <span className="font-medium">Android:</span> {formData.device_split.android}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Audience data
  const AudienceDataStep = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Demographic Targeting</h3>
        <Label>Age Group Distribution</Label>
        <div className="space-y-2">
          {Object.entries(audienceData.age_groups).map(([age, value]) => (
            <div key={age} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{age}</span>
                <span>{value}%</span>
              </div>
              <Slider
                defaultValue={[value]}
                max={100}
                step={1}
                value={[value]}
                onValueChange={(values) => handleAudienceChange('age_groups', age, values[0])}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gender Distribution</Label>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Male</span>
              <span>{audienceData.gender_split.male}%</span>
            </div>
            <Slider
              defaultValue={[audienceData.gender_split.male]}
              max={100}
              step={1}
              value={[audienceData.gender_split.male]}
              onValueChange={(values) => {
                const maleValue = values[0];
                handleAudienceChange('gender_split', 'male', maleValue);
                handleAudienceChange('gender_split', 'female', 100 - maleValue);
              }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Female</span>
            <span>{audienceData.gender_split.female}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Income Distribution</Label>
        <div className="space-y-2">
          {Object.entries(audienceData.income_brackets).map(([bracket, value]) => (
            <div key={bracket} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{bracket}</span>
                <span>{value}%</span>
              </div>
              <Slider
                defaultValue={[value]}
                max={100}
                step={1}
                value={[value]}
                onValueChange={(values) => handleAudienceChange('income_brackets', bracket, values[0])}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>User Interests</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {audienceData.interests.map((interest) => (
            <div key={interest} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
              <span>{interest}</span>
              <button 
                type="button"
                onClick={() => handleAudienceInterestRemove(interest)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <span>×</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Select 
            onValueChange={(value) => {
              if (value) {
                handleAudienceInterestAdd(value);
              }
            }}
          >
            <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
              <SelectValue placeholder="Select common interest" />
            </SelectTrigger>
            <SelectContent>
              {commonInterests
                .filter(interest => !audienceData.interests.includes(interest))
                .map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              id="new-interest"
              placeholder="Add custom interest"
              className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget;
                  if (input.value) {
                    handleAudienceInterestAdd(input.value);
                    input.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              className="px-3 py-2 neu-btn rounded-md"
              onClick={() => {
                const input = document.getElementById('new-interest') as HTMLInputElement;
                if (input && input.value) {
                  handleAudienceInterestAdd(input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Geographic targeting
  const GeographicTargetingStep = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Globe size={20} />
          Geographic Targeting
        </h3>
        
        <div className="space-y-4">
          {/* Cities */}
          <div className="space-y-2">
            <Label>Cities</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {geographicData.cities.length === 0 ? (
                <div className="text-muted-foreground text-sm">No cities specified</div>
              ) : (
                geographicData.cities.map((city) => (
                  <div key={city} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                    <span>{city}</span>
                    <button 
                      type="button"
                      onClick={() => handleGeoItemRemove('cities', city)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="new-city"
                placeholder="Add city"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value) {
                      handleGeoItemAdd('cities', input.value);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-3 py-2 neu-btn rounded-md"
                onClick={() => {
                  const input = document.getElementById('new-city') as HTMLInputElement;
                  if (input && input.value) {
                    handleGeoItemAdd('cities', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* States */}
          <div className="space-y-2">
            <Label>States</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {geographicData.states.length === 0 ? (
                <div className="text-muted-foreground text-sm">No states specified</div>
              ) : (
                geographicData.states.map((state) => (
                  <div key={state} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                    <span>{state}</span>
                    <button 
                      type="button"
                      onClick={() => handleGeoItemRemove('states', state)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="new-state"
                placeholder="Add state"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value) {
                      handleGeoItemAdd('states', input.value);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-3 py-2 neu-btn rounded-md"
                onClick={() => {
                  const input = document.getElementById('new-state') as HTMLInputElement;
                  if (input && input.value) {
                    handleGeoItemAdd('states', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Regions */}
          <div className="space-y-2">
            <Label>Regions</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {geographicData.regions.length === 0 ? (
                <div className="text-muted-foreground text-sm">No regions specified</div>
              ) : (
                geographicData.regions.map((region) => (
                  <div key={region} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                    <span>{region}</span>
                    <button 
                      type="button"
                      onClick={() => handleGeoItemRemove('regions', region)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="new-region"
                placeholder="Add region"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value) {
                      handleGeoItemAdd('regions', input.value);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-3 py-2 neu-btn rounded-md"
                onClick={() => {
                  const input = document.getElementById('new-region') as HTMLInputElement;
                  if (input && input.value) {
                    handleGeoItemAdd('regions', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Countries */}
          <div className="space-y-2">
            <Label>Countries</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {geographicData.countries.length === 0 ? (
                <div className="text-muted-foreground text-sm">No countries specified</div>
              ) : (
                geographicData.countries.map((country) => (
                  <div key={country} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                    <span>{country}</span>
                    <button 
                      type="button"
                      onClick={() => handleGeoItemRemove('countries', country)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="new-country"
                placeholder="Add country"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value) {
                      handleGeoItemAdd('countries', input.value);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-3 py-2 neu-btn rounded-md"
                onClick={() => {
                  const input = document.getElementById('new-country') as HTMLInputElement;
                  if (input && input.value) {
                    handleGeoItemAdd('countries', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Campaign management
  const CampaignManagementStep = (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Campaign Management</h3>
      
      {/* Campaign Funneling */}
      <div className="space-y-2 border-b pb-4">
        <Label className="flex items-center gap-2">
          Campaign Funneling
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {campaignData.funneling.length === 0 ? (
            <div className="text-muted-foreground text-sm">No campaign funneling options specified</div>
          ) : (
            campaignData.funneling.map((item) => (
              <div key={item} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
                <span>{item}</span>
                <button 
                  type="button"
                  onClick={() => handleCampaignItemRemove('funneling', item)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input
            id="new-funnel"
            placeholder="Add funnel stage (e.g., Awareness, Consideration)"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  handleCampaignItemAdd('funneling', input.value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 neu-btn rounded-md"
            onClick={() => {
              const input = document.getElementById('new-funnel') as HTMLInputElement;
              if (input && input.value) {
                handleCampaignItemAdd('funneling', input.value);
                input.value = '';
              }
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Buy Types */}
      <div className="space-y-2 border-b pb-4">
        <Label className="flex items-center gap-2">
          Buy Types
        </Label>
        <div className="flex flex-wrap gap-2">
          {buyTypes.map((buyType) => (
            <button
              key={buyType}
              type="button"
              className={`px-3 py-2 rounded-md text-sm ${
                campaignData.buy_types.includes(buyType)
                  ? 'neu-pressed bg-primary/10 text-primary'
                  : 'neu-flat'
              }`}
              onClick={() => handleBuyTypeToggle(buyType)}
            >
              {buyType}
            </button>
          ))}
        </div>
      </div>
      
      {/* Innovations and Gamification */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Innovations and Gamification
        </Label>
        <div className="flex flex-wrap gap-2">
          {innovationOptions.map((innovation) => (
            <button
              key={innovation}
              type="button"
              className={`px-3 py-2 rounded-md text-sm ${
                campaignData.innovations.includes(innovation)
                  ? 'neu-pressed bg-primary/10 text-primary'
                  : 'neu-flat'
              }`}
              onClick={() => handleInnovationToggle(innovation)}
            >
              {innovation}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            id="new-innovation"
            placeholder="Add custom innovation"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  handleCampaignItemAdd('innovations', input.value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 neu-btn rounded-md"
            onClick={() => {
              const input = document.getElementById('new-innovation') as HTMLInputElement;
              if (input && input.value) {
                handleCampaignItemAdd('innovations', input.value);
                input.value = '';
              }
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="min-budget">Minimum Campaign Budget ($)</Label>
          <Input
            id="min-budget"
            type="number"
            min="0"
            placeholder="Enter minimum budget"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={campaignData.min_budget}
            onChange={(e) => handleCampaignChange('min_budget', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="avg-cpm">Average CPM ($)</Label>
          <Input
            id="avg-cpm"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter average CPM"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={campaignData.avg_cpm}
            onChange={(e) => handleCampaignChange('avg_cpm', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="avg-ctr">Average CTR (%)</Label>
        <Input
          id="avg-ctr"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Enter average CTR"
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
          value={campaignData.avg_ctr}
          onChange={(e) => handleCampaignChange('avg_ctr', parseFloat(e.target.value) || 0)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Accepted Ad Formats</Label>
        <div className="flex flex-wrap gap-2">
          {['Image', 'Video', 'Carousel', 'Playable', 'Native', 'Banner', 'Interstitial'].map((format) => (
            <button
              key={format}
              type="button"
              className={`px-3 py-2 rounded-md ${
                campaignData.accepted_formats.includes(format)
                  ? 'neu-pressed bg-primary/10 text-primary'
                  : 'neu-flat'
              }`}
              onClick={() => handleCampaignFormatToggle(format)}
            >
              {format}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="tracking"
          checked={campaignData.tracking_available}
          onCheckedChange={(checked) => handleCampaignChange('tracking_available', checked)}
        />
        <Label htmlFor="tracking">Advanced tracking available</Label>
      </div>
    </div>
  );

  // Step 5: Restrictions
  const RestrictionsStep = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Restricted Categories</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {restrictions.restricted_categories.map((category) => (
            <div key={category} className="flex items-center bg-neugray-200 py-1 px-2 rounded-full text-sm">
              <span>{category}</span>
              <button 
                type="button"
                onClick={() => handleRestrictionCategoryRemove(category)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <span>×</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="new-category"
            placeholder="Add restricted category"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  handleRestrictionCategoryAdd(input.value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 neu-btn rounded-md"
            onClick={() => {
              const input = document.getElementById('new-category') as HTMLInputElement;
              if (input && input.value) {
                handleRestrictionCategoryAdd(input.value);
                input.value = '';
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="min-age">Minimum User Age</Label>
        <Input
          id="min-age"
          type="number"
          min="0"
          max="21"
          placeholder="Enter minimum age"
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
          value={restrictions.min_age}
          onChange={(e) => handleRestrictionChange('min_age', parseInt(e.target.value) || 0)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="geo-targeting"
          checked={restrictions.geo_targeting}
          onCheckedChange={(checked) => handleRestrictionChange('geo_targeting', checked)}
        />
        <Label htmlFor="geo-targeting">Geo-targeting available</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="approval"
          checked={restrictions.requires_approval}
          onCheckedChange={(checked) => handleRestrictionChange('requires_approval', checked)}
        />
        <Label htmlFor="approval">Requires approval before publishing</Label>
      </div>
    </div>
  );

  // Create the steps for our multistep form
  const formSteps = [
    {
      title: "Basic Information",
      content: BasicInfoStep,
      validator: validateBasicInfo
    },
    {
      title: "Audience Data",
      content: AudienceDataStep
    },
    {
      title: "Geographic Targeting",
      content: GeographicTargetingStep
    },
    {
      title: "Campaign Management",
      content: CampaignManagementStep
    },
    {
      title: "Restrictions",
      content: RestrictionsStep
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
            <p className="text-muted-foreground mt-1">
              {isEditMode 
                ? "Update your platform details below" 
                : "Create a new advertising platform in the MobistackIO network"}
            </p>
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
