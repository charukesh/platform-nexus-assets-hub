import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import NeuInput from "@/components/NeuInput";
import { Search, Filter, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmbeddingSearch } from "@/hooks/use-embedding-search";
import PlatformStatsCard from "@/components/dashboard/PlatformStatsCard";
import AssetStatsCard from "@/components/dashboard/AssetStatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AIResponseSection from "@/components/dashboard/AIResponseSection";
import PlatformList from "@/components/dashboard/PlatformList";
const Dashboard: React.FC = () => {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [assetCategories, setAssetCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("ai");
  const [searchBrief, setSearchBrief] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    searchByEmbedding
  } = useEmbeddingSearch();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPlatforms(), fetchAssets()]);
    } finally {
      setLoading(false);
    }
  };
  const fetchPlatforms = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('platforms').select('*');
      if (error) throw error;
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
      const {
        data,
        error
      } = await supabase.from('assets').select('*, platforms(name)');
      if (error) throw error;
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
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) || platform.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase());
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
      console.log('Submitting search brief:', searchBrief);
      const results = await searchByEmbedding(searchBrief);
      console.log('Search results:', results);
      setSearchResults(results);
      if (!results) {
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
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };
  return <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Create a Media Plans</h1>
            <p className="text-muted-foreground mt-1">Enter your brief and get the media plan from your uploaded Platforms &amp; Assets.</p>
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

        <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          

          <TabsContent value="ai" className="mt-6">
            <AIResponseSection searchBrief={searchBrief} searchResults={searchResults} searchLoading={searchLoading} onSearchSubmit={handleSearchSubmit} onSearchBriefChange={e => setSearchBrief(e.target.value)} onClear={() => setSearchBrief('')} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>;
};
export default Dashboard;