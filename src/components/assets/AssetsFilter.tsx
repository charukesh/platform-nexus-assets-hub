
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeuButton from "@/components/NeuButton";
import { Search, Filter, Grid, List } from "lucide-react";
import NeuCard from "@/components/NeuCard";

interface AssetsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  categories: string[];
  platforms: Array<{ id: string; name: string; }>;
}

const AssetsFilter: React.FC<AssetsFilterProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  platformFilter,
  setPlatformFilter,
  viewMode,
  setViewMode,
  categories,
  platforms,
}) => {
  const resetFilters = () => {
    setCategoryFilter("All");
    setPlatformFilter("All");
    setSearchQuery("");
  };

  return (
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
            onClick={resetFilters}
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
  );
};

export default AssetsFilter;
