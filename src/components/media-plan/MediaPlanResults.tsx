
import React from "react";
import NeuButton from "@/components/NeuButton";
import MediaPlanSection from "./MediaPlanSection";
import { Clipboard, Users, BarChart2, Calendar, Coins, Zap } from "lucide-react";

interface MediaPlanResultsProps {
  mediaPlan: {
    executiveSummary: string;
    targetAudienceAnalysis: string;
    platformSelectionRationale: string;
    assetUtilizationStrategy: string;
    budgetAllocation: string;
    measurementStrategy: string;
  };
  onEditRequest: () => void;
  onStartNew: () => void;
}

const MediaPlanResults: React.FC<MediaPlanResultsProps> = ({
  mediaPlan,
  onEditRequest,
  onStartNew,
}) => {
  return (
    <div className="space-y-6">
      <MediaPlanSection
        icon={Clipboard}
        title="Executive Summary"
        content={mediaPlan.executiveSummary}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MediaPlanSection
          icon={Users}
          title="Target Audience Analysis"
          content={mediaPlan.targetAudienceAnalysis}
        />
        <MediaPlanSection
          icon={BarChart2}
          title="Platform Selection & Rationale"
          content={mediaPlan.platformSelectionRationale}
        />
        <MediaPlanSection
          icon={Calendar}
          title="Asset Utilization Strategy"
          content={mediaPlan.assetUtilizationStrategy}
        />
        <MediaPlanSection
          icon={Coins}
          title="Budget Allocation"
          content={mediaPlan.budgetAllocation}
        />
      </div>

      <MediaPlanSection
        icon={Zap}
        title="Expected KPIs & Measurement"
        content={mediaPlan.measurementStrategy}
      />

      <div className="flex justify-between mt-8">
        <NeuButton variant="outline" onClick={onEditRequest}>
          Edit Request
        </NeuButton>
        <NeuButton onClick={onStartNew}>
          Start New Plan
        </NeuButton>
      </div>
    </div>
  );
};

export default MediaPlanResults;
