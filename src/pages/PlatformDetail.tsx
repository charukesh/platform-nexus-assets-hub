import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudienceDataDisplay from "@/components/platform/AudienceDataDisplay";
import DeviceSplitDisplay from "@/components/platform/DeviceSplitDisplay";
import CampaignDisplay from "@/components/platform/CampaignDisplay";
import CommentsSection from "@/components/platform/CommentsSection";
import EditHistoryComponent from "@/components/EditHistoryComponent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Building, Pencil, Trash2, Users, Calendar, Globe, ChartBar, Activity, MessageSquare } from "lucide-react";

const PlatformDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchPlatform(id);
      fetchAssets(id);
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

  const fetchAssets = async (platformId: string) => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("platform_id", platformId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setAssets(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching associated assets",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this platform? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
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
              <span className="inline-block bg-neublue-100 text-neublue-500 text-sm py-0.5 px-2 rounded-full">
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
            <TabsTrigger value="campaign" className="data-[state=active]:neu-pressed">
              Campaign
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:neu-pressed">
              Metrics
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:neu-pressed">
              Assets
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:neu-pressed">
              Edit History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <NeuCard>
                  <div className="w-full aspect-square bg-neugray-200 mb-4 rounded-lg overflow-hidden flex items-center justify-center">
                    {platform?.logo_url ? (
                      <img
                        src={platform.logo_url}
                        alt={platform.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building size={64} className="text-neugray-400" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Industry</Label>
                      <p className="font-medium">{platform?.industry}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Monthly Active Users</Label>
                      <p className="font-medium">{platform?.mau || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Daily Active Users</Label>
                      <p className="font-medium">{platform?.dau || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Premium Users</Label>
                      <p className="font-medium">
                        {platform?.premium_users 
                          ? `${platform.premium_users.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Estimated Reach</Label>
                      <p className="font-medium">
                        {platform?.est_reach 
                          ? `${platform.est_reach.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Impressions</Label>
                      <p className="font-medium">
                        {platform?.impressions 
                          ? `${platform.impressions.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Created</Label>
                      <p className="font-medium">{new Date(platform?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </NeuCard>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                <div className="space-y-6">
                  <NeuCard>
                    <h3 className="text-lg font-bold mb-4">Platform Information</h3>
                    <p className="mt-1">{platform?.description || "No description available"}</p>
                  </NeuCard>
                  
                  <NeuCard>
                    <h3 className="text-lg font-bold mb-4">Device Distribution</h3>
                    {platform?.device_split && (
                      <DeviceSplitDisplay deviceSplit={platform.device_split} />
                    )}
                  </NeuCard>
                  
                  <NeuCard>
                    <h3 className="text-lg font-bold mb-4">Comments</h3>
                    <CommentsSection comments={platform?.comments} />
                  </NeuCard>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audience" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Audience Information</h3>
              {platform?.audience_data && (
                <AudienceDataDisplay audienceData={platform.audience_data} />
              )}
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="campaign" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Campaign Information</h3>
              {platform?.campaign_data && (
                <CampaignDisplay campaignData={platform.campaign_data} />
              )}
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neugray-100 p-4 rounded-lg text-center">
                  <Activity className="h-8 w-8 text-neublue-500 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-muted-foreground">Monthly Active Users</h4>
                  <p className="text-2xl font-bold">{platform?.mau || "N/A"}</p>
                </div>
                
                <div className="bg-neugray-100 p-4 rounded-lg text-center">
                  <Users className="h-8 w-8 text-neublue-500 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-muted-foreground">Daily Active Users</h4>
                  <p className="text-2xl font-bold">{platform?.dau || "N/A"}</p>
                </div>
                
                <div className="bg-neugray-100 p-4 rounded-lg text-center">
                  <Globe className="h-8 w-8 text-neublue-500 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-muted-foreground">Premium Users</h4>
                  <p className="text-2xl font-bold">
                    {platform?.premium_users 
                      ? platform.premium_users.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Label className="text-muted-foreground text-sm">Estimated Reach</Label>
                  <div className="mt-2 neu-pressed p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Reach</span>
                      <span className="font-bold">
                        {platform?.est_reach 
                          ? platform.est_reach.toLocaleString()
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground text-sm">Impressions</Label>
                  <div className="mt-2 neu-pressed p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Impressions</span>
                      <span className="font-bold">
                        {platform?.impressions 
                          ? platform.impressions.toLocaleString()
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-6">
            <NeuCard>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Associated Assets</h3>
                <Link to="/assets/new">
                  <NeuButton variant="outline" size="sm">Add New Asset</NeuButton>
                </Link>
              </div>
              
              {assets.length > 0 ? (
                <div className="space-y-4">
                  {assets.map(asset => (
                    <Link key={asset.id} to={`/assets/${asset.id}`}>
                      <div className="bg-neugray-100 hover:bg-neugray-200 transition-colors p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          {asset.thumbnail_url ? (
                            <img 
                              src={asset.thumbnail_url} 
                              alt={asset.name} 
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neugray-200 rounded flex items-center justify-center mr-3">
                              <ChartBar size={20} className="text-neugray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.category} • {asset.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {asset.buy_types}
                          </p>
                          {asset.amount && (
                            <p className="font-medium">₹{asset.amount.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBar size={36} className="text-neugray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">No assets associated with this platform</p>
                  <Link to="/assets/new">
                    <NeuButton>Create First Asset</NeuButton>
                  </Link>
                </div>
              )}
            </NeuCard>
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
