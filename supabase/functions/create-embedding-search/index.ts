import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

// Define the expected return type from match_assets_by_embedding_only
// We'll keep the TypeScript type but we won't use it in the RPC call
// This will prevent any type mismatches between TypeScript and PostgreSQL
type AssetSearchResult = {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_url: string;
  file_url: string;
  type: string;
  tags: string[];
  buy_types: string;
  amount: string; // Changed from number to string to be more flexible with numeric/integer
  estimated_clicks: number;
  estimated_impressions: number;
  platform_id: string;
  platform_name: string;
  platform_industry: string;
  platform_audience_data: any;
  platform_campaign_data: any;
  platform_device_split: any;
  platform_mau: string;
  platform_dau: string;
  platform_premium_users: number;
  platform_restrictions: any;
  similarity: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
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
    const budget = requestData.budget; // Extract budget if provided
    
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
    

    
    if (vectorSearchError) {
      console.error('Error in vector similarity search:', vectorSearchError);
      throw vectorSearchError;
    }
    
    // This section will be replaced by our updated code
    
    // Comprehensive prompt that handles both normal search and budget planning
    const prompt = `
      I have a collection of marketing assets and platforms. Given the following search query: "${queryText}",
      please provide a helpful response that includes both asset recommendations and a marketing plan.
      
      ${simplifiedAssets.length === 0 ? 
        `Unfortunately, no assets matched your query closely enough. Please suggest 3-5 alternative queries that might yield better results. 
        Explain why the original query might not have matched and what types of marketing assets the user might be looking for.` :
        `Consider these assets that matched your query (higher similarity scores are better matches):
        ${JSON.stringify(simplifiedAssets)}`
      }
      
      Your response should include:
      
      1. A conversational response addressing the query directly
      2. ${simplifiedAssets.length > 0 ? 
          `A list of the most relevant assets (up to 5) with brief explanations of why each is suitable` : 
          `Suggested alternative queries that might yield better results`
        }
      3. ${simplifiedAssets.length > 0 ? 
          `A marketing plan in CSV-like format:
          
          MARKETING PLAN:
          Asset,Platform,Description,Estimated Impressions,Estimated Clicks,Budget Allocation,Estimated Cost
          [asset name],[platform name],[brief description],[estimated impressions],[estimated clicks],[% of budget],[calculated cost]
          
          For this plan:
          - Include the 3-5 most impactful assets
          - Use the asset's amount field as the base cost
          - If no budget is mentioned in the query, suggest a budget of 5-8 lakhs (₹500,000-800,000) and create a plan with that range
          - Calculate estimated costs based on budget allocations
          - Make sure percentages add up to 100%` : 
          `A brief explanation of what types of marketing assets would be helpful based on the user's apparent needs`
        }
      
      4. A helpful conclusion with next steps or questions
      
      Be conversational and helpful throughout. Format the marketing plan as a neat table. If the query mentions a specific budget, use that budget in your plan instead of the default range.
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
            content: 'You are a helpful marketing asset assistant. Your job is to help users find the perfect marketing assets for their needs and create actionable marketing plans. Provide detailed asset recommendations and structured budget allocations based on the query.'
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
    const mentionedAssetIds = (simplifiedAssets || [])
      .filter(asset => 
        conversationalContent.includes(asset.id) || 
        conversationalContent.includes(asset.name)
      )
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
        method: 'asset-search-with-plan',
        query: queryText,
        budget: budget,
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