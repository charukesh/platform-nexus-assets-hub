
import React from "react";
import { FileImage } from "lucide-react";
import { Link } from "react-router-dom";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";

interface AssetStatsCardProps {
  assetStats: {
    total: number;
    byCategory: Array<{ name: string; count: number }>;
  };
}

const AssetStatsCard: React.FC<AssetStatsCardProps> = ({ assetStats }) => {
  return (
    <NeuCard>
      <div className="flex items-center gap-3 mb-4">
        <FileImage className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Assets Overview</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="neu-pressed p-4 rounded-lg">
          <p className="text-muted-foreground mb-1">Total Assets</p>
          <p className="text-2xl font-bold">{assetStats.total}</p>
        </div>
        <div className="neu-pressed p-4 rounded-lg">
          <p className="text-muted-foreground mb-1">Categories</p>
          <p className="text-2xl font-bold">{assetStats.byCategory.length}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="font-medium">Category Distribution</p>
        {assetStats.byCategory.map(item => (
          <div key={item.name} className="flex justify-between items-center">
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-neugray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${(item.count / assetStats.total * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
      <Link to="/assets" className="inline-block">
        <NeuButton size="sm">View All Assets</NeuButton>
      </Link>
    </NeuCard>
  );
};

export default AssetStatsCard;
