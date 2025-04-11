
import React from "react";
import NeuCard from "@/components/NeuCard";
import { CampaignData } from "@/types/campaign";

interface CampaignDetailsProps {
  data: CampaignData;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ data }) => {
  return (
    <NeuCard className="mb-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
      
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          The campaign feature has been removed. Please contact your administrator for more information.
        </p>
      </div>
    </NeuCard>
  );
};

export default CampaignDetails;
