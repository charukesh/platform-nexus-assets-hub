
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Brain } from "lucide-react";

interface MediaPlanInputFormProps {
  prompt: string;
  setPrompt: (value: string) => void;
  advertiserInfo: string;
  setAdvertiserInfo: (value: string) => void;
  budget: string;
  setBudget: (value: string) => void;
  timeframe: string;
  setTimeframe: (value: string) => void;
  includeAllPlatforms: boolean;
  setIncludeAllPlatforms: (value: boolean) => void;
  includeAllAssets: boolean;
  setIncludeAllAssets: (value: boolean) => void;
  onGenerateClick: () => void;
  isGenerating: boolean;
  platforms: any[];
  assets: any[];
}

const MediaPlanInputForm: React.FC<MediaPlanInputFormProps> = ({
  prompt,
  setPrompt,
  advertiserInfo,
  setAdvertiserInfo,
  budget,
  setBudget,
  timeframe,
  setTimeframe,
  includeAllPlatforms,
  setIncludeAllPlatforms,
  includeAllAssets,
  setIncludeAllAssets,
  onGenerateClick,
  isGenerating,
  platforms,
  assets,
}) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Brain className="text-primary" size={20} />
        Create Media Plan
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            What are you looking for?
          </label>
          <Textarea
            placeholder="e.g., Create a media plan for a new fitness app launch targeting young professionals in urban areas"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Advertiser Information (Optional)
          </label>
          <Textarea
            placeholder="e.g., FitLife Pro is a premium fitness app offering personalized workout plans and nutrition guidance"
            value={advertiserInfo}
            onChange={(e) => setAdvertiserInfo(e.target.value)}
            className="h-16"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Budget (Optional)
            </label>
            <Input
              placeholder="e.g., $50,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Timeframe (Optional)
            </label>
            <Input
              placeholder="e.g., Q3 2025 (3 months)"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md p-4 bg-neugray-50">
          <h3 className="font-medium mb-3">Data Options</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Include Platform Data</p>
                <p className="text-sm text-muted-foreground">
                  Use data from {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Switch
                checked={includeAllPlatforms}
                onCheckedChange={setIncludeAllPlatforms}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Include Asset Data</p>
                <p className="text-sm text-muted-foreground">
                  Use data from {assets.length} asset{assets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Switch
                checked={includeAllAssets}
                onCheckedChange={setIncludeAllAssets}
              />
            </div>
          </div>
        </div>

        <NeuButton
          onClick={onGenerateClick}
          disabled={isGenerating || !prompt}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Generating Media Plan...
            </>
          ) : (
            <>Generate Media Plan</>
          )}
        </NeuButton>
      </div>
    </NeuCard>
  );
};

export default MediaPlanInputForm;
