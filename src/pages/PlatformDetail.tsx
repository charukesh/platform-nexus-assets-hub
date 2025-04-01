
import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Edit, FileImage, Users, PieChart, Smartphone, MapPin, Tag, CheckCircle, Clock, Info } from "lucide-react";

// Mock platform data
const platformData = {
  id: 1,
  name: "Instagram",
  industry: "Social Media",
  mau: "1.2B",
  dau: "500M",
  premiumUsers: 12,
  deviceSplit: { ios: 55, android: 45 },
  
  audience: {
    demographic: {
      ageGroups: ["18-24", "25-34"],
      gender: ["Male", "Female"],
      interests: ["Technology", "Fashion", "Travel", "Food"]
    },
    geographic: {
      cities: ["New York", "Los Angeles", "Chicago"],
      states: ["California", "New York", "Texas"],
      regions: ["West Coast", "Northeast"]
    }
  },
  
  campaign: {
    funneling: "Instagram campaigns follow a multi-stage funnel approach starting with awareness through Stories, followed by consideration via Feed ads, and conversion through Shopping features.",
    buyTypes: ["CPM", "CPC", "CPA"],
    innovations: "Innovative formats include AR try-on filters, shoppable posts, and interactive polls integrated into ad experiences."
  },
  
  restrictions: {
    blockedCategories: ["Adult Content", "Tobacco", "Gambling"],
    minimumSpend: 5000,
    didYouKnow: "Instagram engagement rates are 4x higher when using location tags in campaign posts."
  },
  
  assets: [
    {
      id: 1,
      name: "Instagram Static Masthead",
      category: "Digital",
      type: "Static Masthead",
      thumbnailUrl: "https://via.placeholder.com/300x150?text=Instagram+Masthead",
    },
    {
      id: 4,
      name: "Instagram Story Ad",
      category: "Digital",
      type: "Story Ad",
      thumbnailUrl: "https://via.placeholder.com/300x150?text=Instagram+Story",
    },
    {
      id: 9,
      name: "Instagram Shopping Integration",
      category: "Digital",
      type: "Shopping Ad",
      thumbnailUrl: "https://via.placeholder.com/300x150?text=Shopping+Integration",
    },
  ]
};

const PlatformDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const platform = platformData; // In a real app, you'd fetch the platform by ID
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{platform.name}</h1>
              <span className="inline-block text-sm bg-neugray-200 py-0.5 px-2 rounded-full">
                {platform.industry}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">Detailed platform information and assets</p>
          </div>
          <div className="flex gap-2">
            <Link to="/assets/new">
              <NeuButton variant="secondary" className="flex items-center gap-1">
                <FileImage size={16} />
                Add Asset
              </NeuButton>
            </Link>
            <Link to={`/platforms/${id}/edit`}>
              <NeuButton className="flex items-center gap-1">
                <Edit size={16} />
                Edit Platform
              </NeuButton>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8 neu-flat p-1 w-full grid grid-cols-4 gap-1">
                <TabsTrigger value="overview" className="data-[state=active]:neu-pressed">
                  Overview
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

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <NeuCard>
                  <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Users size={16} />
                        <span>MAU</span>
                      </div>
                      <div className="font-medium text-lg">{platform.mau}</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Users size={16} />
                        <span>DAU</span>
                      </div>
                      <div className="font-medium text-lg">{platform.dau}</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <PieChart size={16} />
                        <span>Premium</span>
                      </div>
                      <div className="font-medium text-lg">{platform.premiumUsers}%</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Smartphone size={16} />
                        <span>iOS / Android</span>
                      </div>
                      <div className="font-medium text-lg">
                        {platform.deviceSplit.ios}% / {platform.deviceSplit.android}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Device Split</h3>
                    <div className="w-full h-4 bg-neugray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${platform.deviceSplit.ios}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>iOS: {platform.deviceSplit.ios}%</span>
                      <span>Android: {platform.deviceSplit.android}%</span>
                    </div>
                  </div>
                </NeuCard>
                
                <NeuCard>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Platform Assets</h2>
                    <Link to="/assets" className="text-primary text-sm flex items-center hover:underline">
                      <span>View all</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {platform.assets.map((asset) => (
                      <Link to={`/assets/${asset.id}`} key={asset.id}>
                        <NeuCard className="hover:shadow-neu-pressed transition-all h-full">
                          <div className="w-full h-28 bg-neugray-200 rounded-lg overflow-hidden mb-3">
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-medium line-clamp-1">{asset.name}</h3>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{asset.category}</span>
                            <span>{asset.type}</span>
                          </div>
                        </NeuCard>
                      </Link>
                    ))}
                  </div>
                </NeuCard>
              </TabsContent>

              {/* Audience Tab */}
              <TabsContent value="audience" className="space-y-6">
                <NeuCard>
                  <h2 className="text-xl font-semibold mb-4">Demographic Targeting</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Age Groups</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.demographic.ageGroups.map((age) => (
                          <div key={age} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                            {age}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Gender</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.demographic.gender.map((gender) => (
                          <div key={gender} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                            {gender}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.demographic.interests.map((interest) => (
                          <div key={interest} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                            {interest}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </NeuCard>
                
                <NeuCard>
                  <h2 className="text-xl font-semibold mb-4">Geographic Targeting</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Cities</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.geographic.cities.map((city) => (
                          <div key={city} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                            <MapPin size={14} />
                            {city}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">States</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.geographic.states.map((state) => (
                          <div key={state} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                            <MapPin size={14} />
                            {state}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Regions</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience.geographic.regions.map((region) => (
                          <div key={region} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                            <MapPin size={14} />
                            {region}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </NeuCard>
              </TabsContent>

              {/* Campaign Tab */}
              <TabsContent value="campaign" className="space-y-6">
                <NeuCard>
                  <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="funneling" className="border-neugray-200">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <Tag size={18} />
                          Campaign Funneling
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="py-4 px-6 neu-pressed rounded-lg">
                        <p>{platform.campaign.funneling}</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="buy-types" className="border-neugray-200">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <CheckCircle size={18} />
                          Buy Types
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="py-4 px-6 neu-pressed rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {platform.campaign.buyTypes.map((type) => (
                            <div key={type} className="bg-primary/10 text-primary py-1 px-3 rounded-lg text-sm">
                              {type}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="innovations" className="border-neugray-200">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <Info size={18} />
                          Innovations and Gamification
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="py-4 px-6 neu-pressed rounded-lg">
                        <p>{platform.campaign.innovations}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </NeuCard>
              </TabsContent>

              {/* Restrictions Tab */}
              <TabsContent value="restrictions" className="space-y-6">
                <NeuCard>
                  <h2 className="text-xl font-semibold mb-4">Restrictions and Minimums</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Categories Blocked</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.restrictions.blockedCategories.map((category) => (
                          <div key={category} className="py-1 px-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Minimum Spend</h3>
                      <div className="neu-pressed p-3 rounded-lg inline-block">
                        <div className="flex items-center gap-1">
                          <Clock size={18} />
                          <span className="text-lg font-medium">${platform.restrictions.minimumSpend.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">per campaign</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-neublue-100 p-4 rounded-lg border border-neublue-200">
                      <h3 className="font-medium mb-2 flex items-center gap-1 text-neublue-500">
                        <Info size={18} />
                        Did You Know
                      </h3>
                      <p className="text-neublue-500">{platform.restrictions.didYouKnow}</p>
                    </div>
                  </div>
                </NeuCard>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <NeuCard className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Platform Insights</h2>
              <div className="space-y-4">
                <div className="neu-pressed p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">User Growth (Monthly)</p>
                  <p className="text-lg font-medium">+3.2%</p>
                </div>
                
                <div className="neu-pressed p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Engagement</p>
                  <p className="text-lg font-medium">4.7%</p>
                </div>
                
                <div className="neu-pressed p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Content Type Distribution</p>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Photos</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full h-2 bg-neugray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Videos</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full h-2 bg-neugray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Stories/Reels</span>
                        <span>5%</span>
                      </div>
                      <div className="w-full h-2 bg-neugray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "5%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NeuCard>
            
            <NeuCard>
              <h2 className="text-xl font-semibold mb-4">Latest Assets</h2>
              <div className="space-y-3">
                {platform.assets.map((asset) => (
                  <Link to={`/assets/${asset.id}`} key={asset.id}>
                    <div className="neu-flat hover:shadow-neu-pressed transition-all p-3 rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 bg-neugray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm line-clamp-1">{asset.name}</h3>
                        <p className="text-xs text-muted-foreground">{asset.type}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Link to="/assets/new">
                  <NeuButton variant="outline" size="sm" className="w-full">
                    Add New Asset
                  </NeuButton>
                </Link>
              </div>
            </NeuCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlatformDetail;
