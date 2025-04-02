
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { BarChart, Users, Smartphone, Pencil, Trash2, ExternalLink, Clock, RefreshCw, Tag } from "lucide-react";
import EditHistoryComponent from "@/components/EditHistoryComponent";

const PlatformDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [platform, setPlatform] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchPlatform(id);
      fetchPlatformAssets(id);
    }
  }, [id]);

  const fetchPlatform = async (platformId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .eq("id", platformId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPlatform(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platform details",
        description: error.message,
        variant: "destructive"
      });
      navigate("/platforms");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformAssets = async (platformId: string) => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("platform_id", platformId);
        
      if (error) throw error;
      
      if (data) {
        setAssets(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platform assets",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const formatUserCount = (count: string | number | null | undefined): string => {
    if (!count) return "N/A";
    
    const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
    if (isNaN(Number(numValue))) return "N/A";
    
    return `${Math.round(Number(numValue) / 1000000)}M`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this platform? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // First check if there are associated assets
      if (assets.length > 0) {
        toast({
          title: "Cannot delete platform",
          description: "This platform has associated assets. Please remove or reassign them first.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from("platforms")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Platform deleted successfully"
      });
      
      navigate("/platforms");
    } catch (error: any) {
      toast({
        title: "Error deleting platform",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !platform) {
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{platform?.name}</h1>
              <span className="inline-block text-sm bg-neugray-200 py-0.5 px-2 rounded-full">
                {platform?.industry}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">Platform Details and Management</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/platforms/${id}/edit`}>
              <NeuButton className="flex items-center gap-2">
                <Pencil size={16} />
                Edit Platform
              </NeuButton>
            </Link>
            <NeuButton 
              variant="outline" 
              className="flex items-center gap-2 text-red-500"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 size={16} />
              Delete
            </NeuButton>
          </div>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="neu-flat bg-white p-1">
            <TabsTrigger value="overview" className="data-[state=active]:neu-pressed">
              Overview
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:neu-pressed">
              Audience
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:neu-pressed">
              Assets
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:neu-pressed">
              Edit History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NeuCard className="p-4">
                <Label className="text-muted-foreground text-sm">Monthly Active Users</Label>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold">{formatUserCount(platform?.mau)}</p>
                  <Users size={20} className="text-primary" />
                </div>
              </NeuCard>
              
              <NeuCard className="p-4">
                <Label className="text-muted-foreground text-sm">Daily Active Users</Label>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold">{formatUserCount(platform?.dau)}</p>
                  <Clock size={20} className="text-primary" />
                </div>
              </NeuCard>
              
              <NeuCard className="p-4">
                <Label className="text-muted-foreground text-sm">Premium Users</Label>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold">{platform?.premium_users || 0}%</p>
                  <Tag size={20} className="text-primary" />
                </div>
              </NeuCard>
              
              <NeuCard className="p-4">
                <Label className="text-muted-foreground text-sm">Connected Assets</Label>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold">{assets.length}</p>
                  <ExternalLink size={20} className="text-primary" />
                </div>
              </NeuCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NeuCard>
                <h3 className="text-lg font-bold mb-4">Device Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>iOS</span>
                      <span>{platform?.device_split?.ios || 50}%</span>
                    </div>
                    <div className="w-full h-3 bg-neugray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${platform?.device_split?.ios || 50}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Android</span>
                      <span>{platform?.device_split?.android || 50}%</span>
                    </div>
                    <div className="w-full h-3 bg-neugray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${platform?.device_split?.android || 50}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </NeuCard>
              
              <NeuCard>
                <h3 className="text-lg font-bold mb-4">Platform Information</h3>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Created</Label>
                    <p className="font-medium">{new Date(platform?.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Last Updated</Label>
                    <p className="font-medium">{new Date(platform?.updated_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Industry</Label>
                    <p className="font-medium">{platform?.industry}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Platform ID</Label>
                    <p className="font-medium truncate text-muted-foreground">{platform?.id}</p>
                  </div>
                </div>
              </NeuCard>
            </div>
          </TabsContent>
          
          <TabsContent value="audience" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Demographics</h3>
              {platform?.audience_data?.demographic ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Age Groups</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {platform.audience_data.demographic.ageGroups?.map((ageGroup: any, idx: number) => (
                        <div key={idx} className="neu-pressed p-3 rounded-lg text-center">
                          <p className="font-medium">{ageGroup.name}</p>
                          <p className="text-sm text-muted-foreground">{ageGroup.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Gender</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {platform.audience_data.demographic.gender?.map((genderData: any, idx: number) => (
                        <div key={idx} className="neu-pressed p-3 rounded-lg text-center">
                          <p className="font-medium">{genderData.name}</p>
                          <p className="text-sm text-muted-foreground">{genderData.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {platform.audience_data.demographic.interests?.map((interest: any, idx: number) => (
                        <div key={idx} className="neu-flat px-2 py-1 rounded-full text-sm">
                          {interest.name} ({interest.percentage}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No demographic data available</p>
              )}
            </NeuCard>
            
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Geographic Distribution</h3>
              {platform?.audience_data?.geographic ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Top Cities</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {platform.audience_data.geographic.cities?.map((city: any, idx: number) => (
                        <div key={idx} className="neu-pressed p-3 rounded-lg">
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-muted-foreground">{city.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Top States/Provinces</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {platform.audience_data.geographic.states?.map((state: any, idx: number) => (
                        <div key={idx} className="neu-pressed p-3 rounded-lg">
                          <p className="font-medium">{state.name}</p>
                          <p className="text-sm text-muted-foreground">{state.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Regions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platform.audience_data.geographic.regions?.map((region: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center mb-2">
                          <span>{region.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-neugray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${region.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{region.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No geographic data available</p>
              )}
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Platform Assets</h3>
              <Link to="/assets/new">
                <NeuButton size="sm" className="flex items-center gap-2">
                  <Pencil size={14} />
                  Add Asset
                </NeuButton>
              </Link>
            </div>
            
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Link key={asset.id} to={`/assets/${asset.id}`}>
                    <NeuCard className="h-full hover:shadow-neu-pressed transition-all cursor-pointer">
                      <div className="w-full h-32 bg-neugray-200 mb-3 rounded-lg overflow-hidden">
                        {asset.thumbnail_url ? (
                          <img
                            src={asset.thumbnail_url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone size={36} className="text-neugray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium">{asset.name}</h4>
                          <span className={`text-xs py-0.5 px-1.5 rounded-full 
                            ${asset.category === "Digital" ? "bg-neublue-100 text-neublue-500" : 
                              asset.category === "Physical" ? "bg-green-100 text-green-600" : 
                              "bg-purple-100 text-purple-600"}`}>
                            {asset.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {asset.description || "No description"}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-1">
                          {asset.tags && asset.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {asset.tags && asset.tags.length > 3 && (
                            <span className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                              +{asset.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </NeuCard>
                  </Link>
                ))}
              </div>
            ) : (
              <NeuCard className="py-6 text-center">
                <p className="text-muted-foreground mb-4">No assets have been associated with this platform yet</p>
                <Link to="/assets/new">
                  <NeuButton size="sm">Add First Asset</NeuButton>
                </Link>
              </NeuCard>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            {platform?.id && (
              <EditHistoryComponent 
                entityId={platform.id} 
                entityType="platform"
                title="Platform Edit History" 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PlatformDetail;
