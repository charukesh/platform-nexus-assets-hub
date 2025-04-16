
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import NeuInput from "@/components/NeuInput";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        // Convert the media plan object into a formatted string
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                What kind of media plan would you like to generate?
              </label>
              <NeuInput
                as="textarea"
                placeholder="e.g., Create a media plan for a new fitness app launch targeting young professionals in urban areas"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <NeuButton
              onClick={generatePlan}
              disabled={isGenerating || !prompt}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Brain className="mr-2" size={20} />
                  Generate Plan
                </>
              )}
            </NeuButton>
          </div>
        </NeuCard>

        {response && (
          <NeuCard className="prose max-w-none">
            <div className="whitespace-pre-wrap font-mono text-sm">
              {response}
            </div>
          </NeuCard>
        )}
      </div>
    </Layout>
  );
};

export default MediaPlanGenerator;
