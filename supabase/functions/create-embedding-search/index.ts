import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

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
    const azureEmbeddingDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION') || '2023-05-15';
    
    // Validate configuration
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_DEPLOYMENT_NAME:', azureDeployment ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureEmbeddingDeployment ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_VERSION:', azureApiVersion ? '✓ Present' : '✗ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase configuration');
    }
    
    if (!azureApiKey || !azureInstance || !azureDeployment || !azureEmbeddingDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Parse request data
    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    // Accept either 'query' or 'text' parameter
    const queryText = requestData.query || requestData.text;
    const matchCount = requestData.matchCount || 15; // Default to top 15 assets
    const matchThreshold = requestData.matchThreshold || 0.7; // Default similarity threshold
    
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }
    
    console.log('Processing query:', queryText);
    
    // Azure OpenAI setup for embeddings and endpoint
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    
    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureEmbeddingDeployment,
      modelName: azureEmbeddingDeployment
    });
    
    // Generate embeddings for the query
    console.log('Generating query embeddings...');
    const [queryEmbedding] = await embeddings.embedDocuments([queryText]);
    console.log('Query embeddings generated successfully');
    
    // Query database for similar assets using vector search
    console.log('Performing vector similarity search...');
    const { data: similarAssets, error: vectorSearchError } = await supabaseClient.rpc(
      'match_assets_by_embedding_only',
      { 
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      }
    );
    
    if (vectorSearchError) {
      console.error('Error in vector similarity search:', vectorSearchError);
      throw vectorSearchError;
    }
    
    console.log(`Found ${similarAssets?.length || 0} assets via vector similarity`);
    
    // If no assets found through vector search, fall back to fetching all assets
    let assets = similarAssets;
    if (!assets || assets.length === 0) {
      throw new Error('No similar assets found, fetching all assets...');
    }
    
    // Prepare simplified asset data for the prompt
    const simplifiedAssets = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      description: asset.description,
      type: asset.type,
      tags: asset.tags,
      platform_name: asset.platform_name,
      platform_industry: asset.platform_industry,
      similarity: asset.similarity
    }));
    
    // Enhanced prompt to instruct AI to respond with relevant assets only
    const prompt = `
      I have a collection of marketing assets and platforms. Given the following search query: "${queryText}",
      please identify the most relevant assets for this query from the list below and respond in a conversational manner.
      
      Consider the asset name, category, description, type, tags, and the platform it belongs to when determining relevance.
      These assets have already been pre-filtered by similarity, with scores provided.
      
      Available assets: ${JSON.stringify(simplifiedAssets)}
      
      Respond like an AI chat assistant would:
      1. Start with a natural, conversational response addressing the user's query directly
      2. Provide only the truly relevant assets based on their query (up to 10 maximum)
      3. If no assets are directly relevant to the query, be honest about that fact
      4. For each relevant asset, explain why it's applicable and how it might help
      5. End with a helpful conclusion or follow-up question
      
      DO NOT include any separate JSON object in your response. The entire response should be 
      natural language that a user would read.
      
      I will handle extracting the structured data from your response separately, so focus entirely 
      on providing a high-quality, conversational response that only includes truly relevant assets.
    `;
    
    console.log('Calling Azure OpenAI with prompt...');
    const response = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful marketing asset assistant. Respond in a conversational and helpful tone. Your job is to help users find the perfect marketing assets for their needs. Only include assets that are truly relevant to the query.'
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
    
    // Extract the asset IDs mentioned in the response for metadata
    // This is a simple heuristic - in production, you might want to use a more robust approach
    const mentionedAssetIds = assets
      .filter(asset => conversationalContent.includes(asset.id) || 
             conversationalContent.includes(asset.name))
      .map(asset => asset.id);
    
    // Return the combined response with metadata
    return new Response(JSON.stringify({
      id: openaiResponse.id,
      object: "chat.completion",
      created: openaiResponse.created,
      model: `${azureInstance}/${azureDeployment}`,
      choices: openaiResponse.choices,
      usage: openaiResponse.usage,
      metadata: {
        method: 'hybrid-vector-gpt',
        query: queryText,
        vector_results_count: similarAssets?.length || 0,
        mentioned_asset_ids: mentionedAssetIds,
        threshold_used: matchThreshold
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