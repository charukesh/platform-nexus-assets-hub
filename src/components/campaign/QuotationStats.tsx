
import React from "react";
import NeuCard from "@/components/NeuCard";
import { formatCurrency, formatNumber } from "@/utils/formatUtils";

interface QuotationStatsProps {
  budget: number;
  totalCost: number;
  totalImpressions: number;
  platformCount: number;
}

const QuotationStats: React.FC<QuotationStatsProps> = ({ 
  budget, 
  totalCost, 
  totalImpressions, 
  platformCount 
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="neu-pressed p-4 rounded-lg">
        <p className="text-muted-foreground mb-1">Total Budget</p>
        <p className="text-2xl font-bold">{formatCurrency(budget)}</p>
      </div>
      <div className="neu-pressed p-4 rounded-lg">
        <p className="text-muted-foreground mb-1">Estimated Cost</p>
        <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
      </div>
      <div className="neu-pressed p-4 rounded-lg">
        <p className="text-muted-foreground mb-1">Estimated Impressions</p>
        <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
      </div>
      <div className="neu-pressed p-4 rounded-lg">
        <p className="text-muted-foreground mb-1">Selected Platforms</p>
        <p className="text-2xl font-bold">{platformCount}</p>
      </div>
    </div>
  );
};

export default QuotationStats;
