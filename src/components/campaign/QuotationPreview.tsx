
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (data) {
      fetchData();
    }
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate campaign data
      if (!data || typeof data !== 'object') {
        console.error("Invalid campaign data:", data);
        setPlatforms([]);
        setError("Invalid campaign data");
        return;
      }
      
      // Ensure platform preferences is a valid array
      if (!data.platformPreferences || !Array.isArray(data.platformPreferences) || data.platformPreferences.length === 0) {
        console.log("No platform preferences found or invalid platform preferences");
        setPlatforms([]);
        setLoading(false);
        return;
      }
      
      const quotation = await generateCampaignQuotation(data);
      
      // Validate quotation result
      if (!quotation) {
        console.error("No quotation returned");
        setPlatforms([]);
        setError("Failed to generate quotation");
        return;
      }
      
      // Ensure platforms is a valid array
      if (Array.isArray(quotation.platforms)) {
        setPlatforms(quotation.platforms);
        setTotalCost(quotation.totalCost || 0);
        setTotalImpressions(quotation.totalImpressions || 0);
        setCampaignDays(quotation.campaignDays || data.durationDays || 1);
      } else {
        console.error("Invalid platforms array in quotation:", quotation.platforms);
        setPlatforms([]);
        setError("Invalid platforms data");
      }
    } catch (error: any) {
      console.error("Error generating quotation:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error generating quotation",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  // Check for valid campaign data
  if (!data || typeof data !== 'object') {
    return <EmptyPlatforms message="Missing or invalid campaign data" error={true} />;
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
      ) : error ? (
        <EmptyPlatforms message={`Error: ${error}`} error={true} />
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
        <EmptyPlatforms message={
          data.platformPreferences && Array.isArray(data.platformPreferences) && data.platformPreferences.length > 0
            ? "No platforms available for this campaign configuration"
            : "No platforms selected for this campaign"
        } />
      )}
    </div>
  );
};

export default QuotationPreview;
