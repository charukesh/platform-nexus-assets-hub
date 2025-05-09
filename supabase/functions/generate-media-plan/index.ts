
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
              content: `You are a media planning assistant that creates JSON-formatted media plans. 
              Always respond with structured JSON data in the following format:
              
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
              
              Make sure all fields are included. Use realistic values for all metrics based on industry standards. 
              Return budget values as plain numbers, not formatted strings.
              Always calculate CTR as clicks/impressions and CPC as budget/clicks.
              Ensure all values are consistent - e.g. budget divided by clicks should equal CPC.`
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
    } catch (error) {
      console.error("Error parsing JSON from AI response:", error);
      // If parsing fails, return the original content
      mediaPlan = content;
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
        stack: Deno.env.get('NODE_ENV') === 'development' ? error.stack : undefined
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
