
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all Azure OpenAI configuration values
    const openAIApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_API_DEPLOYMENT_NAME');
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION') || '2023-05-15';

    if (!openAIApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Missing required Azure OpenAI configuration');
    }

    const requestData = await req.json();
    const { prompt } = requestData;

    if (!prompt) {
      throw new Error('A prompt is required for generating a media plan');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch all assets with their associated platform details
    console.log('Fetching assets and platforms data...');
    const { data: assets, error: assetsError } = await supabaseClient
      .from('assets')
      .select(`
        *,
        platforms (
          id,
          name,
          industry,
          audience_data,
          device_split,
          mau,
          dau,
          premium_users,
          restrictions
        )
      `);

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      throw assetsError;
    }

    // Ensure assets exists and is an array before proceeding
    if (!assets || !Array.isArray(assets)) {
      console.log('No assets found or invalid response format');
      throw new Error('No assets found or invalid response format');
    }

    console.log(`Successfully fetched ${assets.length} assets with platform data`);

    // Prepare detailed asset and platform information for the prompt
    const detailedAssets = assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      type: asset.type,
      description: asset.description || '',
      tags: asset.tags || [],
      platform: asset.platforms ? {
        name: asset.platforms.name,
        industry: asset.platforms.industry,
        audience: asset.platforms.audience_data,
        deviceSplit: asset.platforms.device_split,
        metrics: {
          mau: asset.platforms.mau,
          dau: asset.platforms.dau,
          premiumUsers: asset.platforms.premium_users
        },
        restrictions: asset.platforms.restrictions
      } : null
    }));

    // Azure OpenAI setup for chat completion
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);

    const systemPrompt = `You are an expert media planner. Based on the user's brief and available assets/platforms, create a comprehensive media plan. Consider:
- Platform audience data and device splits
- Asset relevance and platform fit
- Target audience overlap
- Device targeting opportunities
- Asset performance potential based on platform metrics (MAU/DAU)
- Platform restrictions and requirements`;

    const userPrompt = `
Given this brief: "${prompt}"

Available assets and platforms:
${JSON.stringify(detailedAssets, null, 2)}

Create a detailed media plan that includes:
1. Executive Summary
2. Target Audience Analysis (using platform audience data)
3. Platform Selection & Device Strategy (using device split data)
4. Asset Utilization Strategy (considering tags and platform fit)
5. Budget Allocation & Estimated Performance
6. Platform-Specific Recommendations
7. Technical Requirements & Restrictions

Format the response as JSON with these sections as properties. Include specific metrics and targeting recommendations based on the platform data.
For the JSON structure, use these exact property names:
{
  "executiveSummary": "...",
  "targetAudienceAnalysis": "...",
  "platformSelectionRationale": "...",
  "assetUtilizationStrategy": "...",
  "budgetAllocation": "...",
  "measurementStrategy": "..."
}`;

    console.log('Calling Azure OpenAI with enhanced prompt...');
    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': openAIApiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const openaiResponse = await response.json();
    let parsedPlan;

    try {
      const content = openaiResponse.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        error: 'Failed to parse AI response into JSON format'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', openaiResponse?.choices?.[0]?.message?.content);
      throw new Error('Failed to parse media plan from AI response');
    }

    console.log('Successfully generated media plan');

    return new Response(
      JSON.stringify({ 
        mediaPlan: parsedPlan,
        assets: detailedAssets 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-media-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: Deno.env.get('NODE_ENV') === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
