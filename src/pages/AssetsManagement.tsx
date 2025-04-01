
import React, { useState } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Upload, Download, Grid, List, Calendar, Info, Tag, ExternalLink } from "lucide-react";

// Mock data for assets
const mockAssets = [
  {
    id: 1,
    name: "Instagram Static Masthead",
    category: "Digital",
    type: "Static Masthead",
    platformName: "Instagram",
    description: "High-impact header placement with static image",
    tags: ["Social", "Header", "Banner"],
    uploadDate: "2023-10-15",
    fileSize: "2.4MB",
    uploadedBy: "Sarah Johnson",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Instagram+Masthead",
  },
  {
    id: 2,
    name: "Spotify Premium Banner",
    category: "Digital",
    type: "Premium Banner",
    platformName: "Spotify",
    description: "Banner displayed for Spotify premium users",
    tags: ["Music", "Banner", "Premium"],
    uploadDate: "2023-09-22",
    fileSize: "1.8MB",
    uploadedBy: "Mike Chen",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Spotify+Banner",
  },
  {
    id: 3,
    name: "YouTube Video Masthead",
    category: "Digital",
    type: "Video Masthead",
    platformName: "YouTube",
    description: "Autoplay video masthead for maximum visibility",
    tags: ["Video", "Header", "Autoplay"],
    uploadDate: "2023-11-05",
    fileSize: "8.2MB",
    uploadedBy: "Alex Rodriguez",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=YouTube+Video",
  },
  {
    id: 4,
    name: "TikTok Shoppable Story",
    category: "Digital",
    type: "Shoppable Story",
    platformName: "TikTok",
    description: "Interactive shopping experience in story format",
    tags: ["Shopping", "Interactive", "Social"],
    uploadDate: "2023-10-30",
    fileSize: "3.5MB",
    uploadedBy: "Jennifer Lee",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=TikTok+Shoppable",
  },
  {
    id: 5,
    name: "Co-branded Rider Jersey",
    category: "Physical",
    type: "Rider Jersey",
    platformName: "Uber",
    description: "Branded jerseys for delivery partners",
    tags: ["Apparel", "Branding", "Delivery"],
    uploadDate: "2023-09-10",
    fileSize: "4.1MB",
    uploadedBy: "David Smith",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Uber+Jersey",
  },
  {
    id: 6,
    name: "Shopping Mall Kiosk",
    category: "Physical",
    type: "Kiosk",
    platformName: "Amazon",
    description: "Interactive kiosk for shopping malls",
    tags: ["Retail", "Interactive", "Kiosk"],
    uploadDate: "2023-08-15",
    fileSize: "5.3MB",
    uploadedBy: "Lisa Wong",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Amazon+Kiosk",
  },
  {
    id: 7,
    name: "Uber Journey Ads",
    category: "Phygital",
    type: "Journey Ads",
    platformName: "Uber",
    description: "Contextual ads during rideshare journey",
    tags: ["Rideshare", "Contextual", "Journey"],
    uploadDate: "2023-11-12",
    fileSize: "2.7MB",
    uploadedBy: "Robert Taylor",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Uber+Journey+Ads",
  },
  {
    id: 8,
    name: "Google Maps Integration",
    category: "Phygital",
    type: "Map Integration",
    platformName: "Google",
    description: "Store location highlight on Google Maps",
    tags: ["Maps", "Location", "Highlight"],
    uploadDate: "2023-10-05",
    fileSize: "1.5MB",
    uploadedBy: "Emma Brown",
    thumbnailUrl: "https://via.placeholder.com/300x150?text=Google+Maps",
  },
];

const categories = ["All", "Digital", "Physical", "Phygital"];
const platforms = ["All", "Instagram", "Spotify", "YouTube", "TikTok", "Uber", "Amazon", "Google"];

const AssetsManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesPlatform = platformFilter === "All" || asset.platformName === platformFilter;
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesPlatform && matchesSearch;
  });

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

        {/* Search and filter section */}
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
                    <SelectItem key={platform} value={platform}>
                      {platform}
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

        {/* Display stats */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{filteredAssets.length}</p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Digital</p>
            <p className="text-2xl font-bold">
              {filteredAssets.filter(a => a.category === "Digital").length}
            </p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Physical</p>
            <p className="text-2xl font-bold">
              {filteredAssets.filter(a => a.category === "Physical").length}
            </p>
          </NeuCard>
          <NeuCard className="flex-1 min-w-[120px]">
            <p className="text-sm text-muted-foreground">Phygital</p>
            <p className="text-2xl font-bold">
              {filteredAssets.filter(a => a.category === "Phygital").length}
            </p>
          </NeuCard>
        </div>
        
        {/* Assets display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <NeuCard key={asset.id} className="h-full neu-flat hover:shadow-neu-pressed transition-all">
                <div className="w-full h-40 bg-neugray-200 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
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
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{asset.description}</p>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Info size={12} className="mr-1" />
                    <span className="mr-3">{asset.type}</span>
                    <Tag size={12} className="mr-1" />
                    <span>{asset.platformName}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      <span>{asset.uploadDate}</span>
                    </div>
                    <span>{asset.fileSize}</span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <NeuButton size="sm" variant="outline" className="text-xs flex-1 flex gap-1 items-center justify-center">
                      <Download size={12} />
                      Download
                    </NeuButton>
                    <Link to={`/assets/${asset.id}`} className="flex-1">
                      <NeuButton size="sm" variant="outline" className="text-xs w-full flex gap-1 items-center justify-center">
                        <ExternalLink size={12} />
                        View
                      </NeuButton>
                    </Link>
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        ) : (
          <NeuCard>
            <div className="divide-y divide-neugray-200">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-neugray-200 rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
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
                    <p className="text-sm text-muted-foreground mb-2">{asset.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag, idx) => (
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
                        <span>{asset.platformName}</span>
                      </div>
                      <div className="flex items-center">
                        <Info size={12} className="mr-1" />
                        <span>{asset.type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>{asset.uploadDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <NeuButton size="sm" variant="outline" className="text-xs flex gap-1 items-center justify-center">
                        <Download size={12} />
                        Download
                      </NeuButton>
                      <Link to={`/assets/${asset.id}`}>
                        <NeuButton size="sm" variant="outline" className="text-xs flex gap-1 items-center justify-center">
                          <ExternalLink size={12} />
                          View
                        </NeuButton>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        )}
        
        {filteredAssets.length === 0 && (
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
