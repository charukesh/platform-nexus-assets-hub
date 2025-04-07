
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlatformSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PlatformSearchBar: React.FC<PlatformSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      <Input
        placeholder="Search platforms..."
        className="pl-10 dark:bg-gray-800"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default PlatformSearchBar;
