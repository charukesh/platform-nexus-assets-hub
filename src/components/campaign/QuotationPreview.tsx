
import React, { useEffect, useState } from "react";
import { CampaignData } from "@/pages/CampaignQuotation";
import { useToast } from "@/hooks/use-toast";
import { generateCampaignQuotation, PlatformWithAssets } from "@/services/campaignService";
import QuotationActions from "./QuotationActions";
import QuotationHeader from "./QuotationHeader";
import QuotationStats from "./QuotationStats";
import CampaignDetails from "./CampaignDetails";
import PlatformCard from "./PlatformCard";
import CampaignSummary from "./CampaignSummary";
import EmptyPlatforms from "./EmptyPlatforms";

interface QuotationPreviewProps {
  data: CampaignData;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data }) => {
  const [platforms, setPlatforms] = useState<PlatformWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignDays, setCampaignDays] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const quotation = await generateCampaignQuotation(data);
      
      setPlatforms(quotation.platforms);
      setTotalCost(quotation.totalCost);
      setTotalImpressions(quotation.totalImpressions);
      setCampaignDays(quotation.campaignDays);
    } catch (error: any) {
      toast({
        title: "Error generating quotation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotation-preview">
      <QuotationActions className="mb-6" />
      <QuotationHeader data={data} campaignDays={campaignDays} />

      <div className="mb-6">
        <QuotationStats 
          budget={data.budget}
          totalCost={totalCost}
          totalImpressions={totalImpressions}
          platformCount={platforms.length}
        />
      </div>

      <CampaignDetails data={data} />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : platforms.length > 0 ? (
        <>
          {platforms.map((platform) => (
            <PlatformCard 
              key={platform.id} 
              platform={platform} 
              campaignDays={campaignDays} 
            />
          ))}
          
          <CampaignSummary 
            totalCost={totalCost}
            totalImpressions={totalImpressions}
            campaignDays={campaignDays}
          />
        </>
      ) : (
        <EmptyPlatforms />
      )}
    </div>
  );
};

export default QuotationPreview;
