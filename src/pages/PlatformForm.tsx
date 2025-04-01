
import React from "react";
import { useNavigate } from "react-router-dom";
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

const PlatformForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Platform saved",
      description: "Platform data has been successfully saved.",
    });
    navigate("/");
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Add New Platform</h1>
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry*</Label>
                    <Select required>
                      <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase().replace(/\s+/g, "-")}>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-active-users">Monthly Active Users (MAU)</Label>
                    <Input
                      id="monthly-active-users"
                      placeholder="e.g., 1.2M"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily-active-users">Daily Active Users (DAU)</Label>
                    <Input
                      id="daily-active-users"
                      placeholder="e.g., 500K"
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
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
                          <Checkbox id={`age-${age}`} />
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
                          <Checkbox id={`gender-${gender}`} />
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
                          <Checkbox id={`interest-${interest}`} />
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
                          <Checkbox id={`city-${city}`} />
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
                          <Checkbox id={`state-${state}`} />
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
                          <Checkbox id={`region-${region}`} />
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
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Buy Types</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {buyTypes.map((type) => (
                        <div key={type} className="flex items-center gap-2 neu-flat p-2">
                          <Checkbox id={`buy-type-${type}`} />
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
                          <Checkbox id={`category-${category}`} />
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="did-you-know">Did You Know</Label>
                    <Textarea
                      id="did-you-know"
                      placeholder="Add special insights and notes..."
                      className="bg-white border-none neu-pressed focus-visible:ring-offset-0 min-h-[120px]"
                    />
                  </div>
                </div>
              </NeuCard>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-3">
            <NeuButton type="button" variant="outline" onClick={() => navigate("/")}>
              Cancel
            </NeuButton>
            <NeuButton type="submit">Save Platform</NeuButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PlatformForm;
