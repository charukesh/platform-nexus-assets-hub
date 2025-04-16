import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_API_DEPLOYMENT_NAME');
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION');
    
    // Validate configuration
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_DEPLOYMENT_NAME:', azureDeployment ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_EMBEDDING_API_VERSION:', azureApiVersion ? '✓ Present' : '✗ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase configuration');
    }
    
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Parse request data
    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    // Accept either 'query' or 'text' parameter
    const queryText = requestData.query || requestData.text;
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }
    console.log('Processing query:', queryText);
    
    // UPDATED APPROACH:
    // First fetch all platforms
    console.log('Fetching all platforms...');
    const { data: platforms, error: platformsError } = await supabaseClient
      .from('platforms')
      .select('*');
    
    if (platformsError) {
      console.error('Error fetching platforms:', platformsError);
      throw platformsError;
    }
    console.log(`Fetched ${platforms?.length || 0} platforms`);
    
    // Then fetch all assets
    console.log('Fetching all assets...');
    const { data: assets, error: assetsError } = await supabaseClient
      .from('assets')
      .select('*');
    
    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      throw assetsError;
    }
    console.log(`Fetched ${assets?.length || 0} assets`);
    
    // Create a map of platform ID to platform data for quick lookup
    const platformMap = new Map();
    platforms.forEach(platform => {
      platformMap.set(platform.id, platform);
    });
    
    // Group assets by platform_id
    const assetsByPlatform = new Map();
    
    assets.forEach(asset => {
      if (asset.platform_id) {
        if (!assetsByPlatform.has(asset.platform_id)) {
          assetsByPlatform.set(asset.platform_id, []);
        }
        assetsByPlatform.get(asset.platform_id).push(asset);
      }
    });
    
    // Create a more comprehensive data structure for the prompt
    const platformsWithAssets = platforms.map(platform => {
      const platformAssets = assetsByPlatform.get(platform.id) || [];
      
      return {
        platform: {
          id: platform.id,
          name: platform.name,
          industry: platform.industry,
          dau: platform.dau,
          mau: platform.mau,
          premium_users: platform.premium_users,
          audience_data: platform.audience_data,
          device_split: platform.device_split,
          restrictions: platform.restrictions
        },
        assets: platformAssets.map(asset => ({
          id: asset.id,
          name: asset.name,
          category: asset.category,
          description: asset.description,
          type: asset.type,
          tags: asset.tags,
          file_url: asset.file_url,
          thumbnail_url: asset.thumbnail_url,
          file_size: asset.file_size
        }))
      };
    });
    
    // We also want to prepare a flat list of all assets with their platform information
    // This will be useful for the search functionality
    const allAssetsWithPlatformInfo = assets.map(asset => {
      const platform = asset.platform_id ? platformMap.get(asset.platform_id) : null;
      
      return {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        description: asset.description,
        type: asset.type,
        tags: asset.tags,
        file_url: asset.file_url,
        thumbnail_url: asset.thumbnail_url,
        file_size: asset.file_size,
        platform_id: asset.platform_id,
        platform_name: platform ? platform.name : null,
        platform_industry: platform ? platform.industry : null
      };
    });
    
    // Azure OpenAI setup for chat completion
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    
    // Updated prompt with more comprehensive data structure
    const prompt = `
      I have a collection of marketing platforms and their associated assets. 
      Given the following search query: "${queryText}",
      please identify the most relevant assets for this query from the collection below and respond in a conversational manner.
      
      Consider the asset name, category, description, type, tags, and the platform it belongs to.
      
      Available platforms with their assets: ${JSON.stringify(platformsWithAssets)}
      
      Alternatively, you can also use this flat list of all assets with platform information:
      ${JSON.stringify(allAssetsWithPlatformInfo)}
      
      Respond like an AI chat assistant would:
      1. Start with a natural, conversational response addressing the user's query directly
      2. Provide the top 5-10 most relevant assets based on their query
      3. For each asset, explain why it's relevant and how it might help
      4. Group assets by platform when applicable
      5. End with a helpful conclusion or follow-up question
      
      DO NOT include any separate JSON object in your response. The entire response should be 
      natural language that a user would read.
      
      I will handle extracting the structured data from your response separately, so focus entirely 
      on providing a high-quality, GPT-like conversational response.
    `;
    
    console.log('Calling Azure OpenAI with prompt...');
    const response = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion || '2023-05-15'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful marketing asset assistant. Respond in a conversational and helpful tone, similar to ChatGPT. Your job is to help users find the perfect marketing assets for their needs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const openaiResponse = await response.json();
    const conversationalContent = openaiResponse.choices[0].message.content;
    
    // We're going to return the complete OpenAI response with our metadata
    // This keeps the full conversational response intact
    return new Response(JSON.stringify({
      id: openaiResponse.id,
      object: "chat.completion",
      created: openaiResponse.created,
      model: `${azureInstance}/${azureDeployment}`,
      choices: openaiResponse.choices,
      usage: openaiResponse.usage,
      metadata: {
        method: 'azure-openai-gpt-style',
        query: queryText,
        platforms_count: platforms.length,
        assets_count: assets.length
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in asset search function:', error);
    console.error('Error details:', error.stack || 'No stack trace available');
    
    return new Response(JSON.stringify({
      error: error.message,
      stack: Deno.env.get('NODE_ENV') === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});