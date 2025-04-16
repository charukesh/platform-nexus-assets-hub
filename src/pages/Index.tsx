import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import NeuInput from "@/components/NeuInput";
import { Search, Filter, BarChart2, ChevronRight, Users, PieChart, Layers, Database, FileImage, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmbeddingSearch } from "@/hooks/use-embedding-search";

const Dashboard: React.FC = () => {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [assetCategories, setAssetCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchBrief, setSearchBrief] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();
  const { searchByEmbedding } = useEmbeddingSearch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPlatforms(),
        fetchAssets()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase.from('platforms').select('*');
      if (error) {
        throw error;
      }
      if (data) {
        setPlatforms(data);

        const uniqueIndustries = Array.from(new Set(data.map(platform => platform.industry)));
        setIndustries(["All", ...uniqueIndustries]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*, platforms(name)');

      if (error) {
        throw error;
      }

      if (data) {
        setAssets(data);
        
        const uniqueCategories = Array.from(new Set(data.map(asset => asset.category)));
        setAssetCategories(["All", ...uniqueCategories]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching assets",
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

  const filteredPlatforms = platforms.filter(platform => {
    const matchesIndustry = industryFilter === "All" || platform.industry === industryFilter;
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         platform.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const platformStats = {
    total: platforms.length,
    byIndustry: industries.filter(i => i !== "All").map(industry => ({
      name: industry,
      count: platforms.filter(p => p.industry === industry).length
    }))
  };

  const assetStats = {
    total: assets.length,
    byCategory: assetCategories.filter(c => c !== "All").map(category => ({
      name: category,
      count: assets.filter(a => a.category === category).length
    }))
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchBrief.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search brief",
        variant: "destructive"
      });
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await searchByEmbedding(searchBrief);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search query",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error searching assets:", error);
      toast({
        title: "Search error",
        description: error.message || "Failed to search assets",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Platform Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all your platforms and assets</p>
          </div>
          <div className="flex gap-2">
            <Link to="/platforms/new">
              <NeuButton>Add New Platform</NeuButton>
            </Link>
            <Link to="/assets/new">
              <NeuButton variant="secondary">Add New Asset</NeuButton>
            </Link>
          </div>
        </header>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="neu-flat bg-white p-1">
            <TabsTrigger value="overview" className="data-[state=active]:neu-pressed">
              Overview
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:neu-pressed">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:neu-pressed">
              Assets
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:neu-pressed">
              <span className="flex items-center gap-1">
                <Sparkles size={14} />
                AI Response
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <NeuCard>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-primary" size={24} />
                  <h2 className="text-xl font-bold">Platforms Overview</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="neu-pressed p-4 rounded-lg">
                    <p className="text-muted-foreground mb-1">Total Platforms</p>
                    <p className="text-2xl font-bold">{platformStats.total}</p>
                  </div>
                  <div className="neu-pressed p-4 rounded-lg">
                    <p className="text-muted-foreground mb-1">Industries</p>
                    <p className="text-2xl font-bold">{platformStats.byIndustry.length}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="font-medium">Industry Distribution</p>
                  {platformStats.byIndustry.map(item => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-neugray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(item.count / platformStats.total * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/platforms" className="inline-block">
                  <NeuButton size="sm">View All Platforms</NeuButton>
                </Link>
              </NeuCard>

              <NeuCard>
                <div className="flex items-center gap-3 mb-4">
                  <FileImage className="text-primary" size={24} />
                  <h2 className="text-xl font-bold">Assets Overview</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="neu-pressed p-4 rounded-lg">
                    <p className="text-muted-foreground mb-1">Total Assets</p>
                    <p className="text-2xl font-bold">{assetStats.total}</p>
                  </div>
                  <div className="neu-pressed p-4 rounded-lg">
                    <p className="text-muted-foreground mb-1">Categories</p>
                    <p className="text-2xl font-bold">{assetStats.byCategory.length}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="font-medium">Category Distribution</p>
                  {assetStats.byCategory.map(item => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-neugray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(item.count / assetStats.total * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/assets" className="inline-block">
                  <NeuButton size="sm">View All Assets</NeuButton>
                </Link>
              </NeuCard>
            </div>

            <NeuCard>
              <div className="flex items-center gap-3 mb-4">
                <Layers className="text-primary" size={24} />
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              <div className="divide-y divide-neugray-200">
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading activity...</p>
                  </div>
                ) : (
                  <>
                    {[...platforms.slice(0, 3), ...assets.slice(0, 3)]
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .slice(0, 5)
                      .map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{('category' in item) ? 'Asset' : 'Platform'}</span>
                                <span>•</span>
                                <span>{('industry' in item) ? item.industry : item.category}</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(item.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </>
                )}
              </div>
            </NeuCard>
          </TabsContent>

          <TabsContent value="platforms" className="mt-6">
            <NeuCard className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    placeholder="Search platforms..." 
                    className="pl-10 w-full bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <NeuButton 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => setIndustryFilter("All")}
                    >
                      <Filter size={16} />
                      Filter
                    </NeuButton>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="text-sm font-medium">Industries:</span>
                {industries.map(industry => (
                  <span
                    key={industry}
                    className={`text-xs py-1 px-2 neu-flat hover:shadow-neu-pressed cursor-pointer ${
                      industryFilter === industry ? 'shadow-neu-pressed' : ''
                    }`}
                    onClick={() => setIndustryFilter(industry)}
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </NeuCard>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredPlatforms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredPlatforms.map(platform => (
                  <Link key={platform.id} to={`/platforms/${platform.id}`}>
                    <NeuCard className="h-full hover:shadow-neu-pressed transition-all cursor-pointer animate-scale-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{platform.name}</h3>
                          <span className="inline-block text-xs bg-neugray-200 py-0.5 px-2 rounded-full mt-1">
                            {platform.industry}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="neu-pressed p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Users size={12} />
                            <span>MAU/DAU</span>
                          </div>
                          <div className="font-medium">
                            {formatUserCount(platform.mau)}/{formatUserCount(platform.dau)}
                          </div>
                        </div>
                        <div className="neu-pressed p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <PieChart size={12} />
                            <span>Premium</span>
                          </div>
                          <div className="font-medium">
                            {platform.premium_users || 0}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Device Split</p>
                        <div className="w-full h-2 bg-neugray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${platform.device_split?.ios || 50}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>iOS: {platform.device_split?.ios || 50}%</span>
                          <span>Android: {platform.device_split?.android || 50}%</span>
                        </div>
                      </div>
                    </NeuCard>
                  </Link>
                ))}
              </div>
            ) : (
              <NeuCard className="py-10 text-center mb-8">
                <p className="text-lg font-medium mb-4">No platforms found</p>
                <p className="text-muted-foreground mb-6">Add your first platform to get started</p>
                <Link to="/platforms/new">
                  <NeuButton>Add New Platform</NeuButton>
                </Link>
              </NeuCard>
            )}
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <NeuCard className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    placeholder="Search assets..." 
                    className="pl-10 w-full bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <NeuButton 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => setCategoryFilter("All")}
                    >
                      <Filter size={16} />
                      Filter
                    </NeuButton>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="text-sm font-medium">Categories:</span>
                {assetCategories.map(category => (
                  <span
                    key={category}
                    className={`text-xs py-1 px-2 neu-flat hover:shadow-neu-pressed cursor-pointer ${
                      categoryFilter === category ? 'shadow-neu-pressed' : ''
                    }`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </NeuCard>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map(asset => (
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
                            <FileImage size={48} className="text-neugray-400" />
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
                      </div>
                    </NeuCard>
                  </Link>
                ))}
              </div>
            ) : (
              <NeuCard className="py-10 text-center mb-8">
                <p className="text-lg font-medium mb-4">No assets found</p>
                <p className="text-muted-foreground mb-6">Add your first asset to get started</p>
                <Link to="/assets/new">
                  <NeuButton>Add New Asset</NeuButton>
                </Link>
              </NeuCard>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <NeuCard className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="text-primary" size={24} />
                <h2 className="text-xl font-bold">AI Response</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Enter your query and get an AI-powered response.
              </p>
              
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <NeuInput
                      as="textarea"
                      placeholder="Enter your query..."
                      value={searchBrief}
                      onChange={(e) => setSearchBrief(e.target.value)}
                      className="w-full"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-end">
                    <NeuButton 
                      type="submit" 
                      disabled={searchLoading}
                      className="whitespace-nowrap"
                    >
                      {searchLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search size={16} />
                          Get Response
                        </span>
                      )}
                    </NeuButton>
                  </div>
                </div>
              </form>

              {searchResults && (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-neugray-100 p-6 rounded-lg whitespace-pre-wrap">
                    {searchResults.choices?.[0]?.message?.content || "No response content available"}
                  </div>
                </div>
              )}

              {searchBrief.trim() && !searchResults && !searchLoading && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <Search size={48} className="mx-auto mb-2 opacity-40" />
                    <p>No response found for your query.</p>
                  </div>
                  <NeuButton variant="outline" onClick={() => setSearchBrief('')}>
                    Clear query and try again
                  </NeuButton>
                </div>
              )}
            </NeuCard>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
