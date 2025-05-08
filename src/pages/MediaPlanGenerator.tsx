
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
        body: { 
          prompt,
          format: "include_tables" // Request tables in the response
        }
      });

      if (error) throw error;

      if (data?.mediaPlan) {
        const plan = data.mediaPlan;
        
        // Format the response with markdown tables
        let formattedResponse = "";
        
        // Process each section
        Object.entries(plan).forEach(([key, value]) => {
          const sectionTitle = key.replace(/([A-Z])/g, ' $1').toLowerCase();
          formattedResponse += `## ${sectionTitle}\n\n`;
          
          // Check if the value is an array (potential table data)
          if (Array.isArray(value) && typeof value[0] === 'object') {
            // It's a table, format as markdown table
            const headers = Object.keys(value[0]);
            formattedResponse += `| ${headers.join(' | ')} |\n`;
            formattedResponse += `| ${headers.map(() => '---').join(' | ')} |\n`;
            
            value.forEach(row => {
              formattedResponse += `| ${headers.map(h => {
                if (typeof row[h] === 'number') {
                  // Format numbers with dollar signs if they look like currency
                  return h.toLowerCase().includes('budget') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('spend') || h.toLowerCase().includes('amount')
                    ? `$${row[h].toFixed(2)}`
                    : row[h].toString();
                }
                return row[h] || '';
              }).join(' | ')} |\n`;
            });
            
            // Add a total row if this looks like numeric data
            const hasNumbers = headers.some(header => 
              value.some(row => typeof row[header] === 'number')
            );
            
            if (hasNumbers) {
              const totals = headers.map(header => {
                if (typeof value[0][header] === 'number') {
                  const sum = value.reduce((acc: number, row: any) => acc + (row[header] || 0), 0);
                  
                  // Format with dollar sign if appropriate
                  if (header.toLowerCase().includes('budget') || header.toLowerCase().includes('cost') || 
                      header.toLowerCase().includes('spend') || header.toLowerCase().includes('amount')) {
                    return `$${sum.toFixed(2)}`;
                  }
                  return typeof sum === 'number' ? sum.toFixed(2) : sum;
                }
                return header === headers[0] ? 'Total' : '';
              });
              
              formattedResponse += `| ${totals.join(' | ')} |\n`;
            }
          } else if (typeof value === 'object' && value !== null) {
            // Handle nested objects by converting them to tables
            formattedResponse += `| Key | Value |\n`;
            formattedResponse += `| --- | --- |\n`;
            
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              formattedResponse += `| ${nestedKey} | ${nestedValue} |\n`;
            });
          } else {
            // Regular text
            formattedResponse += `${value}\n`;
          }
          
          formattedResponse += '\n\n';
        });
        
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
