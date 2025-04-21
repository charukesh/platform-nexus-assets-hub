
import React from "react";
import { Link } from "react-router-dom";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { FileIcon, Info, Tag, Calendar, ExternalLink } from "lucide-react";
import { Asset } from "@/types/asset";

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  return (
    <Link to={`/assets/${asset.id}`}>
      <NeuCard className="h-full neu-flat hover:shadow-neu-pressed transition-all cursor-pointer animate-scale-in">
        <div className="w-full h-40 bg-neugray-200 mb-4 rounded-lg overflow-hidden">
          {asset.thumbnail_url ? (
            <img
              src={asset.thumbnail_url}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neugray-200">
              <FileIcon size={48} className="text-neugray-400" />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold line-clamp-1">{asset.name}</h3>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs py-1 px-2 rounded-full 
                ${asset.category === "Digital" ? "bg-neublue-100 text-neublue-500" : 
                  asset.category === "Physical" ? "bg-green-100 text-green-600" : 
                  "bg-purple-100 text-purple-600"}`}>
                {asset.category}
              </span>
              {asset.amount !== null && asset.amount !== undefined && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <span className="text-xs font-semibold">₹</span>
                  {asset.amount.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{asset.description || "No description"}</p>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">Buy Type:</span>
              <span className="bg-neugray-200 px-1.5 py-0.5 rounded">
                {asset.buy_types}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neugray-100 p-2 rounded">
                <div className="text-xs text-muted-foreground">Impressions</div>
                <div className="font-medium">{asset.estimated_impressions.toLocaleString()}</div>
              </div>
              <div className="bg-neugray-100 p-2 rounded">
                <div className="text-xs text-muted-foreground">Clicks</div>
                <div className="font-medium">{asset.estimated_clicks.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Info size={12} className="mr-1" />
            <span className="mr-3">{asset.type}</span>
            <Tag size={12} className="mr-1" />
            <span>{asset.platforms?.name || "No platform"}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags && asset.tags.map((tag: string, idx: number) => (
              <span key={idx} className="text-xs bg-neugray-200 py-0.5 px-1.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{new Date(asset.created_at).toLocaleDateString()}</span>
            </div>
            <span>{asset.file_size || "N/A"}</span>
          </div>
          
          <div className="mt-4">
            <Link to={`/assets/${asset.id}`} className="w-full">
              <NeuButton size="sm" variant="outline" className="text-xs w-full flex gap-1 items-center justify-center">
                <ExternalLink size={12} />
                View Details
              </NeuButton>
            </Link>
          </div>
        </div>
      </NeuCard>
    </Link>
  );
};

export default AssetCard;

