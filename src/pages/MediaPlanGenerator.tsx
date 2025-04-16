import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MediaPlanInputForm from "@/components/media-plan/MediaPlanInputForm";
import MediaPlanResults from "@/components/media-plan/MediaPlanResults";
import { useEmbeddingSearch } from "@/hooks/use-media-plan-generator";

const MediaPlanGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [advertiserInfo, setAdvertiserInfo] = useState("");
  const [budget, setBudget] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaPlan, setMediaPlan] = useState<any>(null);
  const [includeAllPlatforms, setIncludeAllPlatforms] = useState(true);
  const [includeAllAssets, setIncludeAllAssets] = useState(true);
  const [activeTab, setActiveTab] = useState("input");

  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platforms").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*, platforms(name)");
      if (error) throw error;
      return data || [];
    },
  });

  const loading = platformsLoading || assetsLoading;

  const generateMediaPlan = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a brief description of what you're looking for.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setActiveTab("results");
      
      const response = await supabase.functions.invoke("generate-media-plan", {
        body: {
          prompt,
          advertiserInfo,
          budget,
          timeframe,
          platformsData: includeAllPlatforms ? platforms : [],
          assetsData: includeAllAssets ? assets : [],
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate media plan");
      }

      setMediaPlan(response.data.mediaPlan);
      
      toast({
        title: "Success",
        description: "Media plan generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating media plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate media plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Media Plan Generator</h1>
            <p className="text-muted-foreground mt-1">
              Create strategic media plans using AI based on your platforms and assets
            </p>
          </div>
        </header>

        <Tabs defaultValue="input" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="neu-flat bg-white p-1">
            <TabsTrigger value="input" className="data-[state=active]:neu-pressed">
              Input
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:neu-pressed" disabled={!mediaPlan}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-6">
            <MediaPlanInputForm
              prompt={prompt}
              setPrompt={setPrompt}
              advertiserInfo={advertiserInfo}
              setAdvertiserInfo={setAdvertiserInfo}
              budget={budget}
              setBudget={setBudget}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              includeAllPlatforms={includeAllPlatforms}
              setIncludeAllPlatforms={setIncludeAllPlatforms}
              includeAllAssets={includeAllAssets}
              setIncludeAllAssets={setIncludeAllAssets}
              onGenerateClick={generateMediaPlan}
              isGenerating={isGenerating}
              platforms={platforms}
              assets={assets}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {isGenerating ? (
              <NeuCard className="py-16">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                  <h3 className="text-xl font-medium mb-2">Generating Your Media Plan</h3>
                  <p className="text-muted-foreground">
                    This may take up to a minute to complete...
                  </p>
                </div>
              </NeuCard>
            ) : mediaPlan ? (
              <MediaPlanResults
                mediaPlan={mediaPlan}
                onEditRequest={() => setActiveTab("input")}
                onStartNew={() => {
                  setPrompt("");
                  setAdvertiserInfo("");
                  setBudget("");
                  setTimeframe("");
                  setMediaPlan(null);
                  setActiveTab("input");
                }}
              />
            ) : (
              <NeuCard className="py-10 text-center">
                <p className="text-lg font-medium mb-4">No Media Plan Generated Yet</p>
                <p className="text-muted-foreground mb-6">
                  Go to the Input tab to create your first media plan
                </p>
                <NeuButton onClick={() => setActiveTab("input")}>
                  Create Media Plan
                </NeuButton>
              </NeuCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MediaPlanGenerator;
