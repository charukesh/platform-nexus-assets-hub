import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Grid, List, Calendar, Info, Tag, ExternalLink, FileIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Digital", "Physical", "Phygital"];

const AssetsManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
    fetchPlatforms();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*, platforms(name)');

      if (error) {
        throw error;
      }

      if (data) {
        setAssets(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching assets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('id, name');

      if (error) {
        throw error;
      }

      if (data) {
        setPlatforms([{ id: 'All', name: 'All' }, ...data]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesPlatform = platformFilter === "All" || asset.platform_id === platformFilter;
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.tags && asset.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  const countAssetsByCategory = (category: string) => {
    return category === "All" 
      ? assets.length 
      : assets.filter(asset => asset.category === category).length;
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Assets Management</h1>
            <p className="text-muted-foreground mt-1">Browse, search and manage platform assets</p>
          </div>
          <div>
            <Link to="/assets/new">
              <NeuButton className="flex items-center gap-2">
                <Plus size={16} />
                Add New Asset
              </NeuButton>
            </Link>
          </div>
        </header>

        <NeuCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search assets..."
                className="pl-10 w-full bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="bg-white border-none neu-flat hover:shadow-neu-pressed w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={platformFilter}
                onValueChange={setPlatformFilter}
              >
                <SelectTrigger className="bg-white border-none neu-flat hover:shadow-neu-pressed w-[140px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <NeuButton 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => {
                  setCategoryFilter("All");
                  setPlatformFilter("All");
                  setSearchQuery("");
                }}
              >
                <Filter size={16} />
                Reset
              </NeuButton>

              <div className="neu-flat p-1 flex">
                <button
                  className={`p-1.5 rounded-l-md ${viewMode === 'grid' ? 'neu-pressed' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`p-1.5 rounded-r-md ${viewMode === 'list' ? 'neu-pressed' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </NeuCard>

        <div className="mb-6 flex gap-4 flex-wrap">
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{countAssetsByCategory("All")}</p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Digital</p>
            <p className="text-2xl font-bold">
              {countAssetsByCategory("Digital")}
            </p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Physical</p>
            <p className="text-2xl font-bold">
              {countAssetsByCategory("Physical")}
            </p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Phygital</p>
            <p className="text-2xl font-bold">
              {countAssetsByCategory("Phygital")}
            </p>
          </NeuCard>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <Link key={asset.id} to={`/assets/${asset.id}`}>
                <NeuCard className="h-full neu-flat hover:shadow-neu-pressed transition-all cursor-pointer animate-scale-in">
                  <div className="w-full h-40 bg-neugray-200 mb-4 rounded-lg overflow-hidden">
                    {asset.thumbnail_url ? (
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neugray-200">
                        <FileIcon size={48} className="text-neugray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold line-clamp-1">{asset.name}</h3>
                      <span className={`text-xs py-1 px-2 rounded-full 
                        ${asset.category === "Digital" ? "bg-neublue-100 text-neublue-500" : 
                          asset.category === "Physical" ? "bg-green-100 text-green-600" : 
                          "bg-purple-100 text-purple-600"}`}>
                        {asset.category}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{asset.description || "No description"}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">Buy Types:</span>
                        <div className="flex gap-1">
                          {asset.buy_types.map((type, idx) => (
                            <span key={idx} className="bg-neugray-200 px-1.5 py-0.5 rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-neugray-100 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Impressions</div>
                          <div className="font-medium">{asset.estimated_impressions.toLocaleString()}</div>
                        </div>
                        <div className="bg-neugray-100 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Clicks</div>
                          <div className="font-medium">{asset.estimated_clicks.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Info size={12} className="mr-1" />
                      <span className="mr-3">{asset.type}</span>
                      <Tag size={12} className="mr-1" />
                      <span>{asset.platforms?.name || "No platform"}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.tags && asset.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                      </div>
                      <span>{asset.file_size || "N/A"}</span>
                    </div>
                    
                    <div className="mt-4">
                      <Link to={`/assets/${asset.id}`} className="w-full">
                        <NeuButton size="sm" variant="outline" className="text-xs w-full flex gap-1 items-center justify-center">
                          <ExternalLink size={12} />
                          View Details
                        </NeuButton>
                      </Link>
                    </div>
                  </div>
                </NeuCard>
              </Link>
            ))}
          </div>
        ) : (
          <NeuCard>
            <div className="divide-y divide-neugray-200">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-neugray-200 rounded flex-shrink-0 overflow-hidden">
                      {asset.thumbnail_url ? (
                        <img
                          src={asset.thumbnail_url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileIcon size={24} className="text-neugray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{asset.name}</h3>
                      <span className={`text-xs py-0.5 px-1.5 rounded-full inline-block mt-1
                        ${asset.category === "Digital" ? "bg-neublue-100 text-neublue-500" : 
                          asset.category === "Physical" ? "bg-green-100 text-green-600" : 
                          "bg-purple-100 text-purple-600"}`}>
                        {asset.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">{asset.description || "No description"}</p>
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">Buy Types:</span>
                        <div className="flex gap-1">
                          {asset.buy_types.map((type, idx) => (
                            <span key={idx} className="bg-neugray-200 px-1.5 py-0.5 rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Impressions:</span>{' '}
                          <span className="font-medium">{asset.estimated_impressions.toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Clicks:</span>{' '}
                          <span className="font-medium">{asset.estimated_clicks.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {asset.tags && asset.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground space-y-1 mb-2">
                      <div className="flex items-center">
                        <Tag size={12} className="mr-1" />
                        <span>{asset.platforms?.name || "No platform"}</span>
                      </div>
                      <div className="flex items-center">
                        <Info size={12} className="mr-1" />
                        <span>{asset.type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/assets/${asset.id}`}>
                        <NeuButton size="sm" variant="outline" className="text-xs flex gap-1 items-center justify-center">
                          <ExternalLink size={12} />
                          View Details
                        </NeuButton>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        )}
        
        {filteredAssets.length === 0 && !loading && (
          <NeuCard className="py-12 text-center">
            <p className="text-lg font-medium mb-2">No assets found</p>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <NeuButton onClick={() => {
              setCategoryFilter("All");
              setPlatformFilter("All");
              setSearchQuery("");
            }}>
              Reset Filters
            </NeuButton>
          </NeuCard>
        )}
      </div>
    </Layout>
  );
};

export default AssetsManagement;
