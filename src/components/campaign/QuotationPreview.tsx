
import React, { useEffect, useState } from "react";
import { CampaignData } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { generateCampaignQuotation, PlatformWithAssets } from "@/services/campaign";
import QuotationActions from "./QuotationActions";
import QuotationHeader from "./QuotationHeader";
import QuotationStats from "./QuotationStats";
import CampaignDetails from "./CampaignDetails";
import PlatformCard from "./PlatformCard";
import CampaignSummary from "./CampaignSummary";
import EmptyPlatforms from "./EmptyPlatforms";
import LoadingPlatforms from "./LoadingPlatforms";
import { formatUserCount } from "./platformSelectionUtils";

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
    if (data) {
      fetchData();
    }
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ensure data is properly defined and has required properties
      if (!data || !data.platformPreferences || !Array.isArray(data.platformPreferences)) {
        console.log("Campaign data is missing required properties or platformPreferences is not an array");
        setPlatforms([]);
        setLoading(false);
        return;
      }
      
      const quotation = await generateCampaignQuotation(data);
      
      // Ensure we have platforms from the quotation and it's a valid array
      if (quotation && quotation.platforms && Array.isArray(quotation.platforms)) {
        setPlatforms(quotation.platforms);
        setTotalCost(quotation.totalCost || 0);
        setTotalImpressions(quotation.totalImpressions || 0);
        setCampaignDays(quotation.campaignDays || data.durationDays || 1);
      } else {
        console.log("Invalid quotation result or platforms array");
        setPlatforms([]);
      }
    } catch (error: any) {
      console.error("Error generating quotation:", error);
      toast({
        title: "Error generating quotation",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      // Set platforms to empty array in case of error
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  // Ensure we have valid campaign data before rendering
  if (!data) {
    return <EmptyPlatforms message="Missing campaign data" />;
  }

  return (
    <div className="quotation-preview">
      <QuotationActions className="mb-6" />
      <QuotationHeader data={data} campaignDays={campaignDays} />

      <div className="mb-6">
        <QuotationStats 
          budget={data?.budget || 0}
          totalCost={totalCost}
          totalImpressions={totalImpressions}
          platformCount={Array.isArray(platforms) ? platforms.length : 0}
        />
      </div>

      <CampaignDetails data={data} />

      {loading ? (
        <LoadingPlatforms />
      ) : Array.isArray(platforms) && platforms.length > 0 ? (
        <>
          {platforms.map((platform) => (
            <PlatformCard 
              key={platform.id} 
              platform={platform} 
              campaignDays={campaignDays}
              isSelected={true}
              autoSuggestEnabled={false}
              togglePlatform={() => {}}
              formatUserCount={formatUserCount}
            />
          ))}
          
          <CampaignSummary 
            totalCost={totalCost}
            totalImpressions={totalImpressions}
            campaignDays={campaignDays}
          />
        </>
      ) : (
        <EmptyPlatforms message="No platforms available for this campaign configuration" />
      )}
    </div>
  );
};

export default QuotationPreview;
