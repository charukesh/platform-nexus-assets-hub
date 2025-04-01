
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Search, Filter, BarChart2, ChevronRight, Users, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for platforms
const mockPlatforms = [
  {
    id: 1,
    name: "Instagram",
    industry: "Social Media",
    mau: "1.2B",
    dau: "500M",
    premiumUsers: 12,
    deviceSplit: { ios: 55, android: 45 },
  },
  {
    id: 2,
    name: "Spotify",
    industry: "Music Streaming",
    mau: "400M",
    dau: "180M",
    premiumUsers: 40,
    deviceSplit: { ios: 60, android: 40 },
  },
  {
    id: 3,
    name: "YouTube",
    industry: "Video Streaming",
    mau: "2.5B",
    dau: "1B",
    premiumUsers: 8,
    deviceSplit: { ios: 45, android: 55 },
  },
  {
    id: 4,
    name: "TikTok",
    industry: "Short Video",
    mau: "1B",
    dau: "600M",
    premiumUsers: 5,
    deviceSplit: { ios: 65, android: 35 },
  },
];

// Mock data for industries
const industries = ["Social Media", "Music Streaming", "Video Streaming", "Short Video", "E-commerce", "Gaming"];

const Dashboard: React.FC = () => {
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
              />
            </div>
            <div className="flex gap-2">
              <NeuButton variant="outline" className="flex items-center gap-1">
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
                className="text-xs py-1 px-2 neu-flat hover:shadow-neu-pressed cursor-pointer"
              >
                {industry}
              </span>
            ))}
          </div>
        </NeuCard>

        {/* Platforms grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockPlatforms.map((platform) => (
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
                      {platform.mau}/{platform.dau}
                    </div>
                  </div>
                  <div className="neu-pressed p-2 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <PieChart size={12} />
                      <span>Premium</span>
                    </div>
                    <div className="font-medium">
                      {platform.premiumUsers}%
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Device Split</p>
                  <div className="w-full h-2 bg-neugray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${platform.deviceSplit.ios}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>iOS: {platform.deviceSplit.ios}%</span>
                    <span>Android: {platform.deviceSplit.android}%</span>
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
      </div>
    </Layout>
  );
};

export default Dashboard;
