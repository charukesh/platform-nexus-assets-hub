
import React from "react";
import { Database, ChevronRight, Users, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";

interface PlatformStatsCardProps {
  platformStats: {
    total: number;
    byIndustry: Array<{ name: string; count: number }>;
  };
}

const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({ platformStats }) => {
  return (
    <NeuCard>
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Platforms Overview</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="neu-pressed p-4 rounded-lg">
          <p className="text-muted-foreground mb-1">Total Platforms</p>
          <p className="text-2xl font-bold">{platformStats.total}</p>
        </div>
        <div className="neu-pressed p-4 rounded-lg">
          <p className="text-muted-foreground mb-1">Industries</p>
          <p className="text-2xl font-bold">{platformStats.byIndustry.length}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="font-medium">Industry Distribution</p>
        {platformStats.byIndustry.map(item => (
          <div key={item.name} className="flex justify-between items-center">
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-neugray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${(item.count / platformStats.total * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
      <Link to="/platforms" className="inline-block">
        <NeuButton size="sm">View All Platforms</NeuButton>
      </Link>
    </NeuCard>
  );
};

export default PlatformStatsCard;
