
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { useToast } from "@/hooks/use-toast";
import PromptInput from "@/components/media-plan/PromptInput";
import ResponseDisplay from "@/components/media-plan/ResponseDisplay";

const MediaPlanGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-media-plan", {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.mediaPlan) {
        const plan = data.mediaPlan;
        const formattedResponse = Object.entries(plan)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}\n${value}`)
          .join('\n\n');
        
        setResponse(formattedResponse);
      }
    } catch (err: any) {
      console.error("Error generating media plan:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to generate media plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Media Plan Generator</h1>
            <p className="text-muted-foreground mt-1">
              Create strategic media plans using AI
            </p>
          </div>
        </header>

        <NeuCard>
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={generatePlan}
            isGenerating={isGenerating}
          />
        </NeuCard>

        <ResponseDisplay response={response} />
      </div>
    </Layout>
  );
};

export default MediaPlanGenerator;
