
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { FileIcon, Pencil, Trash2, Calendar, FileType, Tag, Info, ExternalLink, Eye } from "lucide-react";
import EditHistoryComponent from "@/components/EditHistoryComponent";

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [asset, setAsset] = useState<any>(null);
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchAsset(id);
    }
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", assetId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setAsset(data);
        
        if (data.platform_id) {
          fetchPlatform(data.platform_id);
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching asset details",
        description: error.message,
        variant: "destructive"
      });
      navigate("/assets");
    }
  };

  const fetchPlatform = async (platformId: string) => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Asset deleted successfully"
      });
      
      navigate("/assets");
    } catch (error: any) {
      toast({
        title: "Error deleting asset",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !asset) {
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
              <h1 className="text-3xl font-bold">{asset?.name}</h1>
              <span className={`inline-block text-sm py-0.5 px-2 rounded-full 
                ${asset?.category === "Digital" ? "bg-neublue-100 text-neublue-500" : 
                  asset?.category === "Physical" ? "bg-green-100 text-green-600" : 
                  "bg-purple-100 text-purple-600"}`}>
                {asset?.category}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">Asset Details and Management</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/assets/${id}/edit`}>
              <NeuButton className="flex items-center gap-2">
                <Pencil size={16} />
                Edit Asset
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
            <TabsTrigger value="details" className="data-[state=active]:neu-pressed">
              Details
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:neu-pressed">
              Preview
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
                    {asset?.thumbnail_url ? (
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileIcon size={64} className="text-neugray-400" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Asset Type</Label>
                      <p className="font-medium">{asset?.type}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Category</Label>
                      <p className="font-medium">{asset?.category}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Associated Platform</Label>
                      {platform ? (
                        <Link to={`/platforms/${platform.id}`}>
                          <p className="font-medium text-blue-600 hover:underline">{platform.name}</p>
                        </Link>
                      ) : (
                        <p className="text-muted-foreground">No platform associated</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">File Size</Label>
                      <p className="font-medium">{asset?.file_size || "Unknown"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Created</Label>
                      <p className="font-medium">{new Date(asset?.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Last Updated</Label>
                      <p className="font-medium">{new Date(asset?.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </NeuCard>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                <NeuCard className="h-full">
                  <h3 className="text-lg font-bold mb-4">Asset Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <p className="mt-1">{asset?.description || "No description available"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {asset?.tags && asset.tags.length > 0 ? (
                          asset.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="inline-block bg-neugray-200 rounded-full px-3 py-1 text-sm">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No tags</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Metadata</Label>
                      <NeuCard className="mt-2 p-4 bg-neugray-200 border-none">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">ID</p>
                            <p className="font-mono text-xs truncate">{asset?.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Created By</p>
                            <p className="font-mono text-xs">{asset?.uploaded_by || "Unknown"}</p>
                          </div>
                        </div>
                      </NeuCard>
                    </div>
                    
                    {asset?.file_url && (
                      <div>
                        <Label className="text-muted-foreground text-sm">Actions</Label>
                        <div className="flex gap-2 mt-2">
                          <Link to="#preview" onClick={() => setActiveTab("preview")}>
                            <NeuButton variant="outline" className="flex items-center gap-2">
                              <Eye size={16} />
                              Preview Asset
                            </NeuButton>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </NeuCard>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Technical Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Asset Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileType size={18} className="text-primary" />
                      <p className="font-medium">{asset?.type}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Category</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag size={18} className="text-primary" />
                      <p className="font-medium">{asset?.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">File Size</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Info size={18} className="text-primary" />
                      <p className="font-medium">{asset?.file_size || "Unknown"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Created Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={18} className="text-primary" />
                      <p className="font-medium">{new Date(asset?.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Last Modified</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={18} className="text-primary" />
                      <p className="font-medium">{new Date(asset?.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Asset ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Info size={18} className="text-primary" />
                      <p className="font-mono text-sm truncate">{asset?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </NeuCard>
            
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Platform Association</h3>
              
              {platform ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground text-sm">Platform Name</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <ExternalLink size={18} className="text-primary" />
                      <Link to={`/platforms/${platform.id}`}>
                        <p className="font-medium text-blue-600 hover:underline">{platform.name}</p>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Industry</Label>
                    <p className="font-medium mt-1">{platform.industry}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Platform ID</Label>
                    <p className="font-mono text-sm truncate mt-1">{platform.id}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Associated On</Label>
                    <p className="font-medium mt-1">{new Date(asset?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">This asset is not associated with any platform</p>
                  <Link to={`/assets/${id}/edit`}>
                    <NeuButton variant="outline" size="sm">
                      Associate Platform
                    </NeuButton>
                  </Link>
                </div>
              )}
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            <NeuCard>
              <h3 className="text-lg font-bold mb-4">Asset Preview</h3>
              
              {asset?.file_url || asset?.thumbnail_url ? (
                <div className="flex justify-center">
                  <div className="max-w-3xl w-full">
                    {asset.type === "Image" ? (
                      <img
                        src={asset.file_url || asset.thumbnail_url}
                        alt={asset.name}
                        className="w-full rounded-lg shadow-lg"
                      />
                    ) : asset.type === "Video" ? (
                      <video
                        src={asset.file_url}
                        controls
                        className="w-full rounded-lg shadow-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : asset.type === "Document" ? (
                      <div className="text-center py-10 neu-pressed rounded-lg">
                        <FileIcon size={64} className="mx-auto text-primary mb-4" />
                        <p className="text-lg font-medium mb-2">{asset.name}</p>
                        <p className="text-muted-foreground mb-4">Document preview not available</p>
                        
                        <Link to={asset.file_url || "#"}>
                          <NeuButton>
                            View Document
                          </NeuButton>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-10 neu-pressed rounded-lg">
                        <FileIcon size={64} className="mx-auto text-primary mb-4" />
                        <p className="text-lg font-medium mb-2">{asset.name}</p>
                        <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                        
                        {asset.file_url && (
                          <Link to={asset.file_url}>
                            <NeuButton>
                              Open File
                            </NeuButton>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileIcon size={64} className="mx-auto text-neugray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">No preview available</p>
                  <p className="text-muted-foreground mb-4">This asset doesn't have a file or thumbnail</p>
                  
                  <Link to={`/assets/${id}/edit`}>
                    <NeuButton>
                      Upload File
                    </NeuButton>
                  </Link>
                </div>
              )}
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            {asset?.id && (
              <EditHistoryComponent 
                entityId={asset.id} 
                entityType="asset"
                title="Asset Edit History" 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AssetDetail;
