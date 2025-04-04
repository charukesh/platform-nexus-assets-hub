import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { 
  PieChart, Pie, LineChart, Line, CartesianGrid, XAxis, YAxis, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart, ReferenceLine,
  RadialBarChart, RadialBar
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart2, Activity } from "lucide-react";

const Analytics: React.FC = () => {
  const { toast } = useToast();
  const [assetsByCategory, setAssetsByCategory] = useState<any[]>([]);
  const [assetsByType, setAssetsByType] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch assets by category
        const { data: categoryData, error: categoryError } = await supabase
          .from('assets')
          .select('category')
          .order('category');
        
        if (categoryError) throw categoryError;
        
        // Fetch assets by type
        const { data: typeData, error: typeError } = await supabase
          .from('assets')
          .select('type');
        
        if (typeError) throw typeError;
        
        // Fetch platforms
        const { data: platformData, error: platformError } = await supabase
          .from('platforms')
          .select('name, premium_users, mau, dau');
        
        if (platformError) throw platformError;
        
        // Process category data
        const categoryCount: Record<string, number> = {};
        categoryData.forEach(item => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
        
        const categoryChartData = Object.keys(categoryCount).map(category => ({
          name: category,
          value: categoryCount[category]
        }));
        
        // Process type data
        const typeCount: Record<string, number> = {};
        typeData.forEach(item => {
          typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });
        
        const typeChartData = Object.keys(typeCount).map(type => ({
          name: type,
          value: typeCount[type]
        }));
        
        // Process platform data
        const processedPlatformData = platformData.map(platform => ({
          name: platform.name,
          premium: platform.premium_users || 0,
          mau: parseInt(platform.mau?.replace(/[^0-9]/g, '') || '0'),
          dau: parseInt(platform.dau?.replace(/[^0-9]/g, '') || '0')
        }));
        
        // Generate mock user growth data (since we don't have real time series data)
        const mockUserGrowthData = [
          { month: 'Jan', users: 4000, newUsers: 2400 },
          { month: 'Feb', users: 4500, newUsers: 1398 },
          { month: 'Mar', users: 5000, newUsers: 9800 },
          { month: 'Apr', users: 6000, newUsers: 3908 },
          { month: 'May', users: 5500, newUsers: 4800 },
          { month: 'Jun', users: 8000, newUsers: 3800 },
          { month: 'Jul', users: 9000, newUsers: 4300 },
          { month: 'Aug', users: 10000, newUsers: 5300 },
          { month: 'Sep', users: 9500, newUsers: 4300 },
          { month: 'Oct', users: 11000, newUsers: 3300 },
          { month: 'Nov', users: 12000, newUsers: 4300 },
          { month: 'Dec', users: 15000, newUsers: 5300 },
        ];
        
        // Generate mock engagement data
        const mockEngagementData = [
          { name: 'Sessions', scoreA: 80, scoreB: 90, fullMark: 100 },
          { name: 'Retention', scoreA: 70, scoreB: 75, fullMark: 100 },
          { name: 'Activities', scoreA: 85, scoreB: 80, fullMark: 100 },
          { name: 'Conversion', scoreA: 65, scoreB: 85, fullMark: 100 },
          { name: 'Social', scoreA: 75, scoreB: 70, fullMark: 100 },
        ];
        
        setAssetsByCategory(categoryChartData);
        setAssetsByType(typeChartData);
        setPlatformStats(processedPlatformData);
        setUserGrowthData(mockUserGrowthData);
        setEngagementData(mockEngagementData);
      } catch (error: any) {
        toast({
          title: "Error fetching analytics",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [toast]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">MobistackIO platform and asset performance metrics</p>
        </header>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="neu-flat bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:neu-pressed dark:text-white">
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:neu-pressed dark:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:neu-pressed dark:text-white">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:neu-pressed dark:text-white">
              <Activity className="h-4 w-4 mr-2" />
              User Metrics
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <NeuCard gradient="blue">
                <h2 className="text-xl font-semibold mb-4 card-header">Assets by Category</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
              
              <NeuCard gradient="green">
                <h2 className="text-xl font-semibold mb-4 card-header">Assets by Type</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assetsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#666' }} />
                      <YAxis tick={{ fill: '#666' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Count" radius={[4, 4, 0, 0]}>
                        {assetsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
            </div>
            
            <NeuCard gradient="purple">
              <h2 className="text-xl font-semibold mb-4 card-header">Platform User Metrics</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={platformStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#666' }} />
                    <YAxis tick={{ fill: '#666' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="premium" stroke="#8884d8" name="Premium Users" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="mau" stroke="#82ca9d" name="Monthly Active Users" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="dau" stroke="#ffc658" name="Daily Active Users" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </NeuCard>
          </TabsContent>
          
          {/* Platforms Tab */}
          <TabsContent value="platforms" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <NeuCard gradient="blue">
                <h2 className="text-xl font-semibold mb-4 card-header">Platform Performance</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={platformStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Legend />
                      <Bar dataKey="premium" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="mau" stackId="a" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dau" stackId="a" fill="#ffc658" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
              
              <NeuCard gradient="orange">
                <h2 className="text-xl font-semibold mb-4 card-header">Platform Engagement Metrics</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={engagementData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#666' }} />
                      <PolarRadiusAxis tick={{ fill: '#666' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Radar name="Platform A" dataKey="scoreA" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Platform B" dataKey="scoreB" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
            </div>
          </TabsContent>
          
          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NeuCard gradient="purple">
                <h2 className="text-xl font-semibold mb-4 card-header">Asset Distribution</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="10%" 
                      outerRadius="80%" 
                      data={assetsByCategory} 
                      startAngle={180} 
                      endAngle={0}
                    >
                      <RadialBar 
                        label={{ fill: '#666', position: 'insideStart' }} 
                        background 
                        dataKey="value" 
                      >
                        {assetsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RadialBar>
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
              
              <NeuCard gradient="green">
                <h2 className="text-xl font-semibold mb-4 card-header">Asset Type Comparison</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={assetsByType}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid stroke="#f5f5f5" />
                      <XAxis dataKey="name" scale="band" tick={{ fill: '#666' }} />
                      <YAxis tick={{ fill: '#666' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Legend />
                      <Bar dataKey="value" barSize={20} fill="#413ea0" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="value" stroke="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
            </div>
          </TabsContent>
          
          {/* User Metrics Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <NeuCard gradient="orange">
                <h2 className="text-xl font-semibold mb-4 card-header">User Growth Trends</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={userGrowthData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: '#666' }} />
                      <YAxis tick={{ fill: '#666' }} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="newUsers" stroke="#82ca9d" fillOpacity={1} fill="url(#colorNewUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
              
              <NeuCard gradient="blue">
                <h2 className="text-xl font-semibold mb-4 card-header">Platform Activity Correlation</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis type="number" dataKey="mau" name="Monthly Active Users" tick={{ fill: '#666' }} />
                      <YAxis type="number" dataKey="premium" name="Premium Users %" tick={{ fill: '#666' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }} />
                      <Scatter name="Platforms" data={platformStats} fill="#8884d8">
                        {platformStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </NeuCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
