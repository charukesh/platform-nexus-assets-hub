
import React from "react";
import NeuCard from "@/components/NeuCard";
import { CampaignData } from "@/pages/CampaignQuotation";

interface CampaignDetailsProps {
  data: CampaignData;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ data }) => {
  return (
    <NeuCard className="mb-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-muted-foreground mb-1">Industry</p>
          <p className="font-medium">{data.industry || "Not specified"}</p>
        </div>
        
        <div>
          <p className="text-muted-foreground mb-1">Objectives</p>
          <div className="flex flex-wrap gap-2">
            {data.objectives.map((objective) => (
              <span key={objective} className="text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded">
                {objective}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-muted-foreground mb-1">Demographics</p>
          <div>
            <p className="text-sm">
              <span className="font-medium">Age Groups:</span>{" "}
              {data.demographics.ageGroups.join(", ")}
            </p>
            <p className="text-sm">
              <span className="font-medium">Gender:</span>{" "}
              {data.demographics.gender.join(", ")}
            </p>
            {data.demographics.interests.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Interests:</span>{" "}
                {data.demographics.interests.join(", ")}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-muted-foreground mb-1">Geographics</p>
          <div>
            <p className="text-sm">
              <span className="font-medium">Tier Levels:</span>{" "}
              {data.geographics.tierLevels.join(", ")}
            </p>
            {data.geographics.cities.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Cities:</span>{" "}
                {data.geographics.cities.join(", ")}
              </p>
            )}
            {data.geographics.states.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">States:</span>{" "}
                {data.geographics.states.join(", ")}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-muted-foreground mb-1">Asset Categories</p>
          <div className="flex flex-wrap gap-2">
            {data.assetCategories.map((category) => (
              <span key={category} className="text-xs bg-neugray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </NeuCard>
  );
};

export default CampaignDetails;
