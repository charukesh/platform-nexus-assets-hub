
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { 
      prompt, 
      platformsData, 
      assetsData, 
      advertiserInfo, 
      budget, 
      timeframe 
    } = await req.json();

    // Enhanced context with embedding information
    const platformsContext = platformsData.length 
      ? `Available platforms (${platformsData.length}): ${JSON.stringify(platformsData.map(p => ({
          name: p.name,
          industry: p.industry,
          audience: p.audience_data,
          userMetrics: {
            mau: p.mau,
            dau: p.dau,
            premiumUsers: p.premium_users,
            deviceSplit: p.device_split
          },
          embedding: p.embedding // Include embedding for semantic understanding
        })))}`
      : "No platforms available.";

    const assetsContext = assetsData.length
      ? `Available assets (${assetsData.length}): ${JSON.stringify(assetsData.map(a => ({
          name: a.name,
          type: a.type,
          category: a.category,
          description: a.description,
          tags: a.tags,
          embedding: a.embedding // Include embedding for semantic understanding
        })))}`
      : "No assets available.";

    const fullPrompt = `
      You are an expert media planning AI assistant. Create a comprehensive media plan based on the following information:
      
      ADVERTISER INFORMATION:
      ${advertiserInfo || "No specific advertiser information provided."}
      
      BUDGET:
      ${budget || "Budget not specified."}
      
      TIMEFRAME:
      ${timeframe || "Timeframe not specified."}
      
      USER'S REQUEST:
      ${prompt}
      
      ${platformsContext}
      
      ${assetsContext}
      
      Create a detailed, strategic media plan with the following sections:
      1. Executive Summary
      2. Target Audience Analysis
      3. Platform Selection & Rationale
      4. Budget Allocation
      5. Asset Utilization Strategy
      6. Expected KPIs & Measurement Strategy
      
      Format the response as JSON with these sections as properties. Each section should be formatted text with proper markdown that can be rendered directly.
    `;

    console.log("Sending prompt to OpenAI:", fullPrompt.substring(0, 200) + "...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a media planning expert with years of experience in digital advertising.' },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const mediaPlan = data.choices[0].message.content;

    // Parse JSON from the response if it's in JSON format
    let parsedPlan;
    try {
      // Attempt to parse if the returned content is JSON
      const jsonStartIdx = mediaPlan.indexOf('{');
      const jsonEndIdx = mediaPlan.lastIndexOf('}');
      
      if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
        const jsonStr = mediaPlan.substring(jsonStartIdx, jsonEndIdx + 1);
        parsedPlan = JSON.parse(jsonStr);
      } else {
        // If not valid JSON format, create a structured format
        parsedPlan = {
          executiveSummary: mediaPlan,
          targetAudienceAnalysis: "",
          platformSelectionRationale: "",
          budgetAllocation: "",
          assetUtilizationStrategy: "",
          measurementStrategy: ""
        };
      }
    } catch (error) {
      console.warn("Error parsing OpenAI response as JSON:", error);
      // Fallback to unstructured format
      parsedPlan = {
        executiveSummary: mediaPlan,
        targetAudienceAnalysis: "",
        platformSelectionRationale: "",
        budgetAllocation: "",
        assetUtilizationStrategy: "",
        measurementStrategy: ""
      };
    }

    return new Response(JSON.stringify({ mediaPlan: parsedPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-media-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
