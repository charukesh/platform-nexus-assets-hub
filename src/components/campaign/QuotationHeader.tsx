import React from "react";
import { Calendar } from "lucide-react";
import NeuCard from "@/components/NeuCard";
import { formatDate } from "@/utils/formatUtils";
import { CampaignData } from "@/types/campaign";

interface QuotationHeaderProps {
  data: CampaignData;
  campaignDays: number;
}

const QuotationHeader: React.FC<QuotationHeaderProps> = ({ data, campaignDays }) => {
  return (
    <NeuCard className="mb-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1">Campaign Quotation</h2>
          <p className="text-muted-foreground">
            Generated on {formatDate(new Date())}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">Campaign Duration:</span>
            {data.duration.startDate && data.duration.endDate ? (
              <span>
                {formatDate(data.duration.startDate)} - {formatDate(data.duration.endDate)}
              </span>
            ) : (
              <span>Not set</span>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium">Days:</span>
            <span>{campaignDays}</span>
          </div>
        </div>
      </div>
    </NeuCard>
  );
};

export default QuotationHeader;
