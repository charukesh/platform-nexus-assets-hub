
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Users, PieChart, Image as ImageIcon } from "lucide-react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlatformListProps {
  loading: boolean;
  filteredPlatforms: any[];
  formatUserCount: (count: string | number | null | undefined) => string;
}

const PlatformList: React.FC<PlatformListProps> = ({
  loading,
  filteredPlatforms,
  formatUserCount,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredPlatforms.length === 0) {
    return (
      <NeuCard className="py-10 text-center mb-8">
        <p className="text-lg font-medium mb-4">No platforms found</p>
        <p className="text-muted-foreground mb-6">Add your first platform to get started</p>
        <Link to="/platforms/new">
          <NeuButton>Add New Platform</NeuButton>
        </Link>
      </NeuCard>
    );
  }

  // Function to get platform initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {filteredPlatforms.map(platform => (
        <Link key={platform.id} to={`/platforms/${platform.id}`}>
          <NeuCard className="h-full hover:shadow-neu-pressed transition-all cursor-pointer animate-scale-in">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 neu-flat">
                  {platform.logo_url ? (
                    <AvatarImage src={platform.logo_url} alt={platform.name} />
                  ) : (
                    <AvatarFallback className="bg-neugray-200 text-primary font-medium">
                      {getInitials(platform.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{platform.name}</h3>
                  <span className="inline-block text-xs bg-neugray-200 py-0.5 px-2 rounded-full mt-1">
                    {platform.industry || "Uncategorized"}
                  </span>
                </div>
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
                  {formatUserCount(platform.mau)}/{formatUserCount(platform.dau)}
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
          </NeuCard>
        </Link>
      ))}
    </div>
  );
};

export default PlatformList;
