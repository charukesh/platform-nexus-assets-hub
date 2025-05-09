
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required');
    }

    // Get AZURE OpenAI credentials from environment
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const endpoint = Deno.env.get('AZURE_OPENAI_CHAT_ENDPOINT') || 
                     `https://${Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME')}.openai.azure.com`;
    const deploymentName = Deno.env.get('AZURE_OPENAI_CHAT_DEPLOYMENT_NAME') ||
                           Deno.env.get('AZURE_OPENAI_API_DEPLOYMENT_NAME');
    const apiVersion = Deno.env.get('AZURE_OPENAI_CHAT_API_VERSION') || 
                       Deno.env.get('AZURE_OPENAI_API_VERSION') || '2023-05-15';
    
    if (!apiKey || !endpoint || !deploymentName) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    const response = await fetch(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a media planning assistant that creates detailed JSON media plans. 
              Always return a valid JSON array of media plan items in the following format ONLY:
              
              [
                {
                  "platform": "Platform Name",
                  "format": "Ad Format",
                  "budget": 1000,
                  "impressions": 500000,
                  "clicks": 5000,
                  "ctr": 0.01,
                  "cpc": 0.2
                },
                {
                  "platform": "Another Platform",
                  "format": "Another Format",
                  "budget": 2000,
                  "impressions": 1000000,
                  "clicks": 10000,
                  "ctr": 0.01,
                  "cpc": 0.2
                }
              ]
              
              IMPORTANT GUIDELINES:
              1. Make sure all fields are included with appropriate numeric values.
              2. Return budget values as plain numbers (no currency symbols).
              3. Return CTR as a decimal (e.g., 0.02 for 2%).
              4. Ensure all calculations are consistent (budget/clicks = CPC, clicks/impressions = CTR).
              5. DO NOT include any explanatory text or markdown formatting - ONLY return the JSON array directly.
              6. ALWAYS return at least 3-5 platforms for diversification.
              7. Use realistic industry CPM/CPC values based on the platforms mentioned.
              8. Prioritize JSON formatting correctness above all else - this must be parseable JSON.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 1,
          max_tokens: 2000
        })
      }
    );
    
    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('No response from OpenAI API');
    }
    
    // Parse the response content to extract the JSON
    const content = result.choices[0].message?.content || '';
    let mediaPlan;
    
    try {
      // Try to extract JSON from the content if it's wrapped in ```json blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        mediaPlan = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the entire content as JSON
        mediaPlan = JSON.parse(content);
      }
      
      // Validate the structure and ensure it's an array
      if (!Array.isArray(mediaPlan)) {
        throw new Error('Response is not a valid array');
      }
    } catch (error) {
      console.error("Error parsing JSON from AI response:", error);
      console.log("Raw content:", content);
      
      // Fallback: Try to extract any array-looking content from the response
      const fallbackMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
      if (fallbackMatch) {
        try {
          mediaPlan = JSON.parse(fallbackMatch[0]);
        } catch (e) {
          console.error("Failed to parse fallback JSON:", e);
          mediaPlan = [];
        }
      } else {
        mediaPlan = [];
      }
    }
    
    return new Response(
      JSON.stringify({ mediaPlan, rawResponse: result }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in generate-media-plan function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during media plan generation',
        mediaPlan: [] // Return empty array in case of error
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
