
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Search, Filter, Server, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlatformList from "@/components/dashboard/PlatformList";

const Platforms: React.FC = () => {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platforms')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setPlatforms(data);
        
        // Make sure we handle potential empty industry values
        const uniqueIndustries = Array.from(
          new Set(
            data.map((platform) => platform.industry || "Uncategorized")
          )
        );
        setIndustries(["All", ...uniqueIndustries]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching platforms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUserCount = (count: string | number | null | undefined): string => {
    if (!count) return "N/A";
    
    const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
    if (isNaN(Number(numValue))) return "N/A";
    
    return `${Math.round(Number(numValue) / 1000000)}M`;
  };

  const filteredPlatforms = platforms.filter((platform) => {
    const matchesIndustry = industryFilter === "All" || platform.industry === industryFilter;
    const matchesSearch = (platform.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (platform.industry || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesIndustry && matchesSearch;
  });

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Platforms</h1>
            <p className="text-muted-foreground mt-1">Manage your platform integrations</p>
          </div>
          <div>
            <Link to="/platforms/new">
              <NeuButton className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Platform
              </NeuButton>
            </Link>
          </div>
        </header>

        <NeuCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search platforms..."
                className="pl-10 w-full bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={industryFilter}
                onValueChange={setIndustryFilter}
              >
                <SelectTrigger className="bg-white border-none neu-flat hover:shadow-neu-pressed w-[180px]">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry || "uncategorized-industry"}>
                      {industry || "Uncategorized"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <NeuButton 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => {
                  setIndustryFilter("All");
                  setSearchQuery("");
                }}
              >
                <Filter size={16} />
                Reset
              </NeuButton>
            </div>
          </div>
        </NeuCard>

        <PlatformList
          loading={loading}
          filteredPlatforms={filteredPlatforms}
          formatUserCount={formatUserCount}
        />
      </div>
    </Layout>
  );
};

export default Platforms;
