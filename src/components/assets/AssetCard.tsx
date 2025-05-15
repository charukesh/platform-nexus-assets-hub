
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Asset } from '@/types/asset';
import { 
  FileImage, 
  Tag, 
  Layers, 
  Box, 
  Monitor 
} from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const CategoryIcon = () => {
    switch (asset.category) {
      case 'Digital':
        return <Monitor size={16} />;
      case 'Physical':
        return <Box size={16} />;
      case 'Phygital':
        return <Layers size={16} />;
      default:
        return <FileImage size={16} />;
    }
  };
  
  return (
    <Link to={`/assets/${asset.id}`} state={{ fromList: true }} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-neu-flat hover:shadow-neu-pressed transition-all duration-300 h-full">
        <div className="relative aspect-video bg-neugray-200 overflow-hidden persistent-element">
          {asset.thumbnail_url ? (
            <img 
              src={asset.thumbnail_url} 
              alt={asset.name} 
              className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileImage size={42} className="text-neugray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className="bg-neugray-200/80 text-foreground backdrop-blur-sm border-0">
              <div className="flex items-center gap-1">
                <CategoryIcon />
                <span>{asset.category}</span>
              </div>
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 truncate">{asset.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {asset.description || "No description provided"}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Tag size={14} className="mr-1" />
              <span>{asset.buy_types || 'N/A'}</span>
            </div>
            
            {asset.amount && (
              <span className="font-medium text-sm">₹{asset.amount}</span>
            )}
          </div>
          
          {asset.tags && asset.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-neugray-100 border-0 text-xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Badge variant="outline" className="bg-neugray-100 border-0 text-xs">
                  +{asset.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
