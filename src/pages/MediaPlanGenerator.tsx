
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanningOutlined, Brain, BarChart2, Calendar, Coins, Users, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch platforms and assets data
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
      
      const response = await fetch(
        "https://lkenxwnqoazfdoabrpxl.functions.supabase.co/generate-media-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            advertiserInfo,
            budget,
            timeframe,
            platformsData: includeAllPlatforms ? platforms : [],
            assetsData: includeAllAssets ? assets : [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate media plan");
      }

      const data = await response.json();
      setMediaPlan(data.mediaPlan);
      
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

  // Function to render markdown content
  const renderMarkdown = (content: string) => {
    if (!content) return null;
    
    // Simple markdown renderer for preview
    return <div dangerouslySetInnerHTML={{ __html: 
      content
        .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold my-3">$1</h1>')
        .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold my-2">$1</h2>')
        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold my-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
    }} />;
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

          <TabsContent value="input" className="mt-6 space-y-6">
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
                  onClick={generateMediaPlan}
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
              <div className="space-y-6">
                <NeuCard>
                  <div className="flex items-center gap-3 mb-4">
                    <PlanningOutlined className="text-primary" size={24} />
                    <h2 className="text-xl font-bold">Executive Summary</h2>
                  </div>
                  {renderMarkdown(mediaPlan.executiveSummary)}
                </NeuCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NeuCard>
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="text-primary" size={24} />
                      <h2 className="text-xl font-bold">Target Audience Analysis</h2>
                    </div>
                    {renderMarkdown(mediaPlan.targetAudienceAnalysis)}
                  </NeuCard>

                  <NeuCard>
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart2 className="text-primary" size={24} />
                      <h2 className="text-xl font-bold">Platform Selection & Rationale</h2>
                    </div>
                    {renderMarkdown(mediaPlan.platformSelectionRationale)}
                  </NeuCard>

                  <NeuCard>
                    <div className="flex items-center gap-3 mb-4">
                      <Coins className="text-primary" size={24} />
                      <h2 className="text-xl font-bold">Budget Allocation</h2>
                    </div>
                    {renderMarkdown(mediaPlan.budgetAllocation)}
                  </NeuCard>

                  <NeuCard>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="text-primary" size={24} />
                      <h2 className="text-xl font-bold">Asset Utilization Strategy</h2>
                    </div>
                    {renderMarkdown(mediaPlan.assetUtilizationStrategy)}
                  </NeuCard>
                </div>

                <NeuCard>
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="text-primary" size={24} />
                    <h2 className="text-xl font-bold">Expected KPIs & Measurement</h2>
                  </div>
                  {renderMarkdown(mediaPlan.measurementStrategy)}
                </NeuCard>

                <div className="flex justify-between mt-8">
                  <NeuButton variant="outline" onClick={() => setActiveTab("input")}>
                    Edit Request
                  </NeuButton>
                  <NeuButton onClick={() => {
                    setPrompt("");
                    setAdvertiserInfo("");
                    setBudget("");
                    setTimeframe("");
                    setMediaPlan(null);
                    setActiveTab("input");
                  }}>
                    Start New Plan
                  </NeuButton>
                </div>
              </div>
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
