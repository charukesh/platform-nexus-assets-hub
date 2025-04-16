
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
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_EMBEDDING_API_VERSION');
    
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
    
    // Fetch all assets with platform data instead of using embeddings
    console.log('Fetching all assets with platform data...');
    const { data: assets, error: assetsError } = await supabaseClient
      .from('assets')
      .select('*, platforms(*)');
    
    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      throw assetsError;
    }
    
    console.log(`Fetched ${assets?.length || 0} assets with platform data`);
    
    // Azure OpenAI setup for chat completion
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    
    // Prepare simplified asset data for the prompt
    const simplifiedAssets = assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      description: asset.description,
      type: asset.type,
      tags: asset.tags,
      platform_name: asset.platforms?.name,
      platform_industry: asset.platforms?.industry
    }));
    
    // Call Azure OpenAI API to process the query against assets
    const prompt = `
      I have a collection of marketing assets and platforms. Given the following search query: "${queryText}",
      please identify the most relevant assets for this query from the list below. 
      Consider the asset name, category, description, type, tags, and the platform it belongs to.
      
      Available assets: ${JSON.stringify(simplifiedAssets)}
      
      Return ONLY the IDs of the top 10 most relevant assets in order of relevance, along with a brief explanation
      of why each asset is relevant to the query. Format your response as valid JSON with this structure:
      {
        "results": [
          {
            "id": "asset-id",
            "name": "asset-name",
            "relevance": "brief explanation of relevance",
            "similarity": 0.95
          }
        ]
      }
      
      The similarity score should be a number between 0 and 1 representing how relevant the asset is to the query.
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
          { role: 'system', content: 'You are a helpful assistant that helps match marketing assets to user queries.' },
          { role: 'user', content: prompt }
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
    const content = openaiResponse.choices[0].message.content;
    
    // Parse the response to get the results
    let parsedResults;
    try {
      // Extract JSON from possible text wrapper
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedResults = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (!parsedResults || !parsedResults.results) {
        throw new Error('Failed to parse results from AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', content);
      throw new Error('Failed to parse results from AI response');
    }
    
    // Return the results
    return new Response(JSON.stringify({ 
      results: parsedResults.results,
      method: 'azure-openai',
      query: queryText
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
