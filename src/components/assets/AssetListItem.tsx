
import React from "react";
import { Link } from "react-router-dom";
import NeuButton from "@/components/NeuButton";
import { FileIcon, Info, Tag, Calendar, ExternalLink } from "lucide-react";
import { Asset } from "@/types/asset";

interface AssetListItemProps {
  asset: Asset;
}

const AssetListItem: React.FC<AssetListItemProps> = ({ asset }) => {
  return (
    <div className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-neugray-200 rounded flex-shrink-0 overflow-hidden">
          {asset.thumbnail_url ? (
            <img
              src={asset.thumbnail_url}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileIcon size={24} className="text-neugray-400" />
            </div>
          )}
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
        <p className="text-sm text-muted-foreground mb-2">{asset.description || "No description"}</p>
        <div className="space-y-2 mb-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">Buy Type:</span>
            <span className="bg-neugray-200 px-1.5 py-0.5 rounded">
              {asset.buy_types}
            </span>
          </div>
          <div className="flex gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Impressions:</span>{' '}
              <span className="font-medium">{asset.estimated_impressions.toLocaleString()}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Clicks:</span>{' '}
              <span className="font-medium">{asset.estimated_clicks.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {asset.tags && asset.tags.map((tag: string, idx: number) => (
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
            <span>{asset.platforms?.name || "No platform"}</span>
          </div>
          <div className="flex items-center">
            <Info size={12} className="mr-1" />
            <span>{asset.type}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>{new Date(asset.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/assets/${asset.id}`}>
            <NeuButton size="sm" variant="outline" className="text-xs flex gap-1 items-center justify-center">
              <ExternalLink size={12} />
              View Details
            </NeuButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssetListItem;
