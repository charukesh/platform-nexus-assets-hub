
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Search, Filter, BarChart2, ChevronRight, Users, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
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
        
        // Extract unique industries for filter
        const uniqueIndustries = Array.from(new Set(data.map((platform) => platform.industry)));
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

  const filteredPlatforms = platforms.filter((platform) => {
    const matchesIndustry = industryFilter === "All" || platform.industry === industryFilter;
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          platform.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesIndustry && matchesSearch;
  });

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

        {/* Search and filter section */}
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
              <NeuButton 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => setIndustryFilter("All")}
              >
                <Filter size={16} />
                Filter
              </NeuButton>
              <NeuButton variant="outline" className="flex items-center gap-1">
                <BarChart2 size={16} />
                Analytics
              </NeuButton>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-sm font-medium">Industries:</span>
            {industries.map((industry) => (
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

        {/* Platforms grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredPlatforms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPlatforms.map((platform) => (
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
                        {platform.mau || "N/A"}/{platform.dau || "N/A"}
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
                  
                  <div className="mt-4 flex gap-2">
                    <NeuButton size="sm" variant="outline" className="text-xs flex-1">
                      Data
                    </NeuButton>
                    <NeuButton size="sm" variant="outline" className="text-xs flex-1">
                      Assets
                    </NeuButton>
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
      </div>
    </Layout>
  );
};

export default Dashboard;
