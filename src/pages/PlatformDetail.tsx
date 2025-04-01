
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Edit, FileImage, Users, PieChart, Smartphone, MapPin, Tag, CheckCircle, Clock, Info, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PlatformDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [platform, setPlatform] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      fetchPlatform();
      fetchPlatformAssets();
    }
  }, [id]);
  
  const fetchPlatform = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPlatform(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlatformAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('platform_id', id);
        
      if (error) throw error;
      
      if (data) {
        setAssets(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching assets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlatform = async () => {
    if (!confirm("Are you sure you want to delete this platform? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the platform
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Platform deleted",
        description: "Platform has been successfully deleted.",
      });
      
      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error deleting platform",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (!platform) {
    return (
      <Layout>
        <NeuCard className="py-10 text-center">
          <p className="text-lg font-medium mb-4">Platform not found</p>
          <p className="text-muted-foreground mb-6">The platform you're looking for doesn't exist or has been deleted</p>
          <Link to="/">
            <NeuButton>Back to Dashboard</NeuButton>
          </Link>
        </NeuCard>
      </Layout>
    );
  }
  
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
            <NeuButton 
              variant="outline" 
              className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
              onClick={handleDeletePlatform}
            >
              <Trash2 size={16} />
              Delete
            </NeuButton>
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
                      <div className="font-medium text-lg">{platform.mau || "N/A"}</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Users size={16} />
                        <span>DAU</span>
                      </div>
                      <div className="font-medium text-lg">{platform.dau || "N/A"}</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <PieChart size={16} />
                        <span>Premium</span>
                      </div>
                      <div className="font-medium text-lg">{platform.premium_users || 0}%</div>
                    </div>
                    
                    <div className="neu-pressed p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Smartphone size={16} />
                        <span>iOS / Android</span>
                      </div>
                      <div className="font-medium text-lg">
                        {platform.device_split?.ios || 50}% / {platform.device_split?.android || 50}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Device Split</h3>
                    <div className="w-full h-4 bg-neugray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${platform.device_split?.ios || 50}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>iOS: {platform.device_split?.ios || 50}%</span>
                      <span>Android: {platform.device_split?.android || 50}%</span>
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
                  
                  {assets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assets.map((asset) => (
                        <Link to={`/assets/${asset.id}`} key={asset.id}>
                          <NeuCard className="hover:shadow-neu-pressed transition-all h-full">
                            <div className="w-full h-28 bg-neugray-200 rounded-lg overflow-hidden mb-3">
                              {asset.thumbnail_url ? (
                                <img
                                  src={asset.thumbnail_url}
                                  alt={asset.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileImage size={32} className="text-neugray-400" />
                                </div>
                              )}
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
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No assets found for this platform</p>
                      <Link to="/assets/new">
                        <NeuButton variant="outline">Add Asset</NeuButton>
                      </Link>
                    </div>
                  )}
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
                        {platform.audience_data?.demographic?.ageGroups?.length > 0 ? (
                          platform.audience_data.demographic.ageGroups.map((age: string) => (
                            <div key={age} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                              {age}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No age groups specified</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Gender</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience_data?.demographic?.gender?.length > 0 ? (
                          platform.audience_data.demographic.gender.map((gender: string) => (
                            <div key={gender} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                              {gender}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No gender targeting specified</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience_data?.demographic?.interests?.length > 0 ? (
                          platform.audience_data.demographic.interests.map((interest: string) => (
                            <div key={interest} className="neu-pressed py-1 px-3 rounded-lg text-sm">
                              {interest}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No interests specified</p>
                        )}
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
                        {platform.audience_data?.geographic?.cities?.length > 0 ? (
                          platform.audience_data.geographic.cities.map((city: string) => (
                            <div key={city} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                              <MapPin size={14} />
                              {city}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No cities specified</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">States</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience_data?.geographic?.states?.length > 0 ? (
                          platform.audience_data.geographic.states.map((state: string) => (
                            <div key={state} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                              <MapPin size={14} />
                              {state}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No states specified</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Regions</h3>
                      <div className="flex flex-wrap gap-2">
                        {platform.audience_data?.geographic?.regions?.length > 0 ? (
                          platform.audience_data.geographic.regions.map((region: string) => (
                            <div key={region} className="flex items-center gap-1 neu-pressed py-1 px-3 rounded-lg text-sm">
                              <MapPin size={14} />
                              {region}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No regions specified</p>
                        )}
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
                        <p>{platform.campaign_data?.funneling || "No campaign funneling information provided."}</p>
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
                          {platform.campaign_data?.buyTypes?.length > 0 ? (
                            platform.campaign_data.buyTypes.map((type: string) => (
                              <div key={type} className="bg-primary/10 text-primary py-1 px-3 rounded-lg text-sm">
                                {type}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No buy types specified</p>
                          )}
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
                        <p>{platform.campaign_data?.innovations || "No innovations or gamification information provided."}</p>
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
                        {platform.restrictions?.blockedCategories?.length > 0 ? (
                          platform.restrictions.blockedCategories.map((category: string) => (
                            <div key={category} className="py-1 px-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                              {category}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No categories blocked</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Minimum Spend</h3>
                      <div className="neu-pressed p-3 rounded-lg inline-block">
                        <div className="flex items-center gap-1">
                          <Clock size={18} />
                          <span className="text-lg font-medium">${platform.restrictions?.minimumSpend?.toLocaleString() || 0}</span>
                          <span className="text-sm text-muted-foreground">per campaign</span>
                        </div>
                      </div>
                    </div>
                    
                    {platform.restrictions?.didYouKnow && (
                      <div className="bg-neublue-100 p-4 rounded-lg border border-neublue-200">
                        <h3 className="font-medium mb-2 flex items-center gap-1 text-neublue-500">
                          <Info size={18} />
                          Did You Know
                        </h3>
                        <p className="text-neublue-500">{platform.restrictions.didYouKnow}</p>
                      </div>
                    )}
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
              {assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.slice(0, 3).map((asset) => (
                    <Link to={`/assets/${asset.id}`} key={asset.id}>
                      <div className="neu-flat hover:shadow-neu-pressed transition-all p-3 rounded-lg flex items-center gap-3">
                        <div className="w-12 h-12 bg-neugray-200 rounded overflow-hidden flex-shrink-0">
                          {asset.thumbnail_url ? (
                            <img
                              src={asset.thumbnail_url}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileImage size={18} className="text-neugray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm line-clamp-1">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground">{asset.type}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center mb-4">No assets available</p>
              )}
              
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
