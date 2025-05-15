
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Users, PieChart, Image as ImageIcon, Clock, Tag } from "lucide-react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
  const location = useLocation();

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

  // Get ad formats badges with color coding
  const getFormatBadges = (adFormats: string[]) => {
    if (!adFormats || !adFormats.length) return null;
    
    const formatColors: Record<string, string> = {
      'Banner': 'bg-blue-100 text-blue-800',
      'Video': 'bg-red-100 text-red-800',
      'Interstitial': 'bg-purple-100 text-purple-800',
      'Native': 'bg-green-100 text-green-800',
      'Carousel': 'bg-amber-100 text-amber-800',
      'Rewarded': 'bg-teal-100 text-teal-800',
      'App Open': 'bg-pink-100 text-pink-800',
      'Rich Media': 'bg-indigo-100 text-indigo-800',
      'Playable': 'bg-orange-100 text-orange-800',
      'Interactive': 'bg-cyan-100 text-cyan-800',
    };
    
    return adFormats.slice(0, 3).map((format, idx) => (
      <Badge key={idx} className={`${formatColors[format] || 'bg-gray-100 text-gray-800'} border-0`}>
        {format}
      </Badge>
    )).concat(
      adFormats.length > 3 
        ? [<Badge key="more" className="bg-gray-100 text-gray-800 border-0">+{adFormats.length - 3}</Badge>] 
        : []
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {filteredPlatforms.map(platform => (
        <Link key={platform.id} to={`/platforms/${platform.id}`} state={{ fromList: true }}>
          <NeuCard className="h-full hover:shadow-neu-pressed transition-all cursor-pointer animate-scale-in">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 neu-flat persistent-element">
                  {platform.logo_url ? (
                    <AvatarImage 
                      src={platform.logo_url} 
                      alt={platform.name} 
                      className="persistent-element"
                    />
                  ) : (
                    <AvatarFallback className="bg-neugray-200 text-primary font-medium persistent-element">
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
            
            {platform.description && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{platform.description}</p>
            )}
            
            {platform.campaign_data?.ad_formats && platform.campaign_data.ad_formats.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {getFormatBadges(platform.campaign_data.ad_formats)}
              </div>
            )}
            
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
                  <Tag size={12} />
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
                <div className="flex h-full">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${platform.device_split?.ios || 0}%` }}
                  ></div>
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${platform.device_split?.android || 0}%` }}
                  ></div>
                  {(platform.device_split?.web || 0) > 0 && (
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${platform.device_split?.web || 0}%` }}
                    ></div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  iOS: {platform.device_split?.ios || 0}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Android: {platform.device_split?.android || 0}%
                </span>
                {(platform.device_split?.web || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Web: {platform.device_split?.web || 0}%
                  </span>
                )}
              </div>
            </div>
            
            {platform.audience_data?.geography_presence && platform.audience_data.geography_presence.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Geography</p>
                <div className="flex flex-wrap gap-1">
                  {platform.audience_data.geography_presence.slice(0, 3).map((geo: string, idx: number) => (
                    <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                      {geo}
                    </span>
                  ))}
                  {platform.audience_data.geography_presence.length > 3 && (
                    <span className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                      +{platform.audience_data.geography_presence.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {platform.campaign_data?.minimum_spend > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min. Spend:</span>
                <span className="font-medium">₹{platform.campaign_data.minimum_spend.toLocaleString()}</span>
              </div>
            )}
          </NeuCard>
        </Link>
      ))}
    </div>
  );
};

export default PlatformList;
