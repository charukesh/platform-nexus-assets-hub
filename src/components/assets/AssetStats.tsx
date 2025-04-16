
import React from "react";
import NeuCard from "@/components/NeuCard";

interface AssetStatsProps {
  countAssetsByCategory: (category: string) => number;
}

const AssetStats: React.FC<AssetStatsProps> = ({ countAssetsByCategory }) => {
  return (
    <div className="mb-6 flex gap-4 flex-wrap">
      <NeuCard className="flex-1 min-w-[120px]">
        <p className="text-sm text-muted-foreground">Total Assets</p>
        <p className="text-2xl font-bold">{countAssetsByCategory("All")}</p>
      </NeuCard>
      <NeuCard className="flex-1 min-w-[120px]">
        <p className="text-sm text-muted-foreground">Digital</p>
        <p className="text-2xl font-bold">
          {countAssetsByCategory("Digital")}
        </p>
      </NeuCard>
      <NeuCard className="flex-1 min-w-[120px]">
        <p className="text-sm text-muted-foreground">Physical</p>
        <p className="text-2xl font-bold">
          {countAssetsByCategory("Physical")}
        </p>
      </NeuCard>
      <NeuCard className="flex-1 min-w-[120px]">
        <p className="text-sm text-muted-foreground">Phygital</p>
        <p className="text-2xl font-bold">
          {countAssetsByCategory("Phygital")}
        </p>
      </NeuCard>
    </div>
  );
};

export default AssetStats;
