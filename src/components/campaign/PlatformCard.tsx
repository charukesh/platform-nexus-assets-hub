
import React from "react";
import { Users } from "lucide-react";
import NeuCard from "@/components/NeuCard";
import { formatCurrency, formatNumber, formatUserCount } from "@/utils/formatUtils";
import { PlatformWithAssets } from "@/services/campaignService";

interface PlatformCardProps {
  platform: PlatformWithAssets;
  campaignDays: number;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, campaignDays }) => {
  return (
    <NeuCard className="mb-4 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h4 className="text-xl font-bold">{platform.name}</h4>
          <p className="text-muted-foreground">{platform.industry || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <div className="flex items-center gap-1">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              MAU: {formatUserCount(platform.mau || 0)}
            </span>
          </div>
          <div className="neu-pressed px-3 py-1 rounded-lg">
            <span className="font-medium">{formatCurrency(platform.totalCost || 0)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-2">Asset</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Est. Impressions</th>
              <th className="text-right p-2">Cost/Day</th>
              <th className="text-right p-2">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {platform.assets.map((asset) => (
              <tr key={asset.id}>
                <td className="p-2 font-medium">{asset.name}</td>
                <td className="p-2">
                  <span className="text-xs px-2 py-1 rounded bg-neugray-200 dark:bg-gray-700">
                    {asset.category}
                  </span>
                </td>
                <td className="p-2 text-right">
                  {formatNumber(asset.estimated_impressions * campaignDays)}
                </td>
                <td className="p-2 text-right">{formatCurrency(asset.cost_per_day)}</td>
                <td className="p-2 text-right font-medium">
                  {formatCurrency(asset.cost_per_day * campaignDays)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-neugray-100 dark:bg-gray-800">
            <tr>
              <td colSpan={2} className="p-2 font-bold">Platform Total</td>
              <td className="p-2 text-right font-bold">{formatNumber(platform.totalImpressions || 0)}</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-bold">{formatCurrency(platform.totalCost || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </NeuCard>
  );
};

export default PlatformCard;
