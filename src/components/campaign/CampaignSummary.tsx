
import React from "react";
import NeuCard from "@/components/NeuCard";
import { formatCurrency, formatNumber } from "@/utils/formatUtils";

interface CampaignSummaryProps {
  totalCost: number;
  totalImpressions: number;
  campaignDays: number;
}

const CampaignSummary: React.FC<CampaignSummaryProps> = ({ 
  totalCost, 
  totalImpressions, 
  campaignDays 
}) => {
  return (
    <NeuCard className="mt-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
      
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <h4 className="font-medium mb-2">Cost Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Platform Costs</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee (10%)</span>
              <span>{formatCurrency(totalCost * 0.1)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{formatCurrency(totalCost * 0.18)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total Campaign Cost</span>
              <span>{formatCurrency(totalCost * 1.28)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium mb-2">Performance Estimates</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Duration</span>
              <span>{campaignDays} days</span>
            </div>
            <div className="flex justify-between">
              <span>Total Impressions</span>
              <span>{formatNumber(totalImpressions)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. CPM</span>
              <span>
                {formatCurrency((totalCost / totalImpressions) * 1000)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Est. Engagement Rate</span>
              <span>2.5%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-neugray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm">
          <span className="font-bold">Note:</span> This quotation is valid for 15 days from the date of generation. 
          Actual campaign performance may vary based on market conditions, creative quality, and audience engagement.
          Final pricing will be confirmed upon campaign approval.
        </p>
      </div>
    </NeuCard>
  );
};

export default CampaignSummary;
