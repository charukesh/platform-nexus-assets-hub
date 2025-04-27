
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AssetsFilter from "@/components/assets/AssetsFilter";
import AssetStats from "@/components/assets/AssetStats";
import AssetCard from "@/components/assets/AssetCard";
import AssetListItem from "@/components/assets/AssetListItem";
import { Asset } from "@/types/asset";

const categories = ["All", "Digital", "Physical", "Phygital"];

const AssetsManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
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
        const validatedAssets = data.map(asset => {
          let category: "Digital" | "Physical" | "Phygital" = "Digital";
          
          if (asset.category === "Physical" || asset.category === "Phygital") {
            category = asset.category;
          }
          
          let buyTypes = asset.buy_types;
          if (Array.isArray(buyTypes)) {
            buyTypes = buyTypes.length > 0 ? buyTypes[0] : 'CPC';
          }
          
          return { 
            ...asset, 
            category,
            buy_types: buyTypes
          } as Asset;
        });
        
        setAssets(validatedAssets);
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

        <AssetsFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          platformFilter={platformFilter}
          setPlatformFilter={setPlatformFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          platforms={platforms}
        />

        <AssetStats countAssetsByCategory={countAssetsByCategory} />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <NeuCard>
            <div className="divide-y divide-neugray-200">
              {filteredAssets.map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
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
