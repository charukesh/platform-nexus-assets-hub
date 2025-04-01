
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { PieChart, Pie, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analytics: React.FC = () => {
  const { toast } = useToast();
  const [assetsByCategory, setAssetsByCategory] = useState<any[]>([]);
  const [assetsByType, setAssetsByType] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        setAssetsByCategory(categoryChartData);
        setAssetsByType(typeChartData);
        setPlatformStats(processedPlatformData);
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
          <p className="text-muted-foreground mt-1">Platform and asset performance metrics</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Assets by Category</h2>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </NeuCard>
          
          <NeuCard>
            <h2 className="text-xl font-semibold mb-4">Assets by Type</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </NeuCard>
        </div>
        
        <NeuCard>
          <h2 className="text-xl font-semibold mb-4">Platform User Metrics</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="premium" stroke="#8884d8" name="Premium Users" />
                <Line type="monotone" dataKey="mau" stroke="#82ca9d" name="Monthly Active Users" />
                <Line type="monotone" dataKey="dau" stroke="#ffc658" name="Daily Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>
      </div>
    </Layout>
  );
};

export default Analytics;
