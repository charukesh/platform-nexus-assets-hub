import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";
import { AzureChatOpenAI } from "npm:@langchain/azure-openai";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { RunnableSequence } from "npm:@langchain/core/runnables";

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
    const matchCount = requestData.matchCount || 3; // Default to top 3 assets
    const matchThreshold = requestData.matchThreshold || 0.75; // Default similarity threshold
    const budget = "5-8 lakhs"; // Always assume a budget plan is needed
    
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
    console.log('Query embeddings generated successfully with length:', queryEmbedding.length);
    
    // Query database for similar assets using vector search
    console.log('Performing vector similarity search with parameters:');
    console.log('- match_threshold:', matchThreshold, 'type:', typeof matchThreshold);
    console.log('- match_count:', matchCount, 'type:', typeof matchCount);
    
    // Ensure parameters have the correct types for PostgreSQL
    const rpcParams = {
      query_embedding: queryEmbedding,
      match_threshold: parseFloat(matchThreshold.toString()), // Ensure this is a float
      match_count: parseInt(matchCount.toString(), 10) // Ensure this is an integer
    };
    
    console.log('Calling match_assets_by_embedding_only with properly typed parameters');
    const { data: matchResults, error: matchError } = await supabaseClient.rpc(
      'match_assets_by_embedding_only',
      rpcParams
    );
    
    if (matchError) {
      console.error('Error in vector similarity search:', matchError);
      throw matchError;
    }
    
    // Process the results to ensure correct data types
    const matchedAssets = matchResults || [];
    console.log(`Found ${matchedAssets.length} assets via vector similarity`);
    
    // Process the assets to include only essential fields and ensure correct types
    const processedAssets = matchedAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      platform: asset.platform,
      platform_name: asset.platform_name,
      platform_description: asset.platform_description,
      amount: asset.amount !== null ? Number(asset.amount) : null,
      estimated_impressions: Number(asset.estimated_impressions),
      estimated_clicks: Number(asset.estimated_clicks),
      similarity: Number(asset.similarity).toFixed(2) // Reduce decimal precision
    }));
    
    // Set up LangChain with Azure OpenAI
    const model = new AzureChatOpenAI({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIEndpoint: azureEndpoint,
      temperature: 0.5,
      maxTokens: 1000
    });
    
    // Create templates based on whether we have results
    let promptTemplate;
    
    if (processedAssets.length === 0) {
      // No results template
      promptTemplate = PromptTemplate.fromTemplate(`
        Search query: "{query}" returned no matching assets.
        
        Provide:
        1. Brief explanation why (1-2 sentences)
        2. 3 alternative queries that might work better
        3. What marketing assets might help (2-3 sentences)
        4. A next step suggestion (1 sentence)
      `);
    } else {
      // Budget planning template
      // Use a streaming approach with LangChain to handle large contexts more efficiently
      promptTemplate = PromptTemplate.fromTemplate(`
        Given search query: "{query}" with budget {budget}, provide a marketing plan based on these assets:
        
        {{#each assets}}
        Asset ID: {{id}}
        Name: {{name}}
        Platform: {{platform}}
        Platform Name: {{platform_name}}
        Platform Description: {{platform_description}}
        Amount: {{amount}}
        Estimated Impressions: {{estimated_impressions}}
        Estimated Clicks: {{estimated_clicks}}
        Similarity: {{similarity}}
        ---
        {{/each}}
        
        Include:
        1. Brief response to query (2-3 sentences)
        2. Marketing plan as:
        
        MARKETING PLAN:
        Asset,Platform,Platform Description,Budget %,Cost,Adj. Impressions,Adj. Clicks
        [name],[platform_name],[platform_description],[%],[cost],[proportional impressions],[proportional clicks]
        
        Rules:
        - Use amount as base cost
        - Ensure % totals 100%
        - Adjust impressions/clicks proportionally to budget
        - Example: If base cost=100K with 50K impressions and allocation=200K, adjusted impressions=100K
        
        3. Brief next steps (1-2 points)
      `);
    }
    
    // Create a processing chain with LangChain
    const chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser()
    ]);
    
    // Prepare inputs for the chain
    const chainInputs = {
      query: queryText,
      budget: budget,
      assets: processedAssets.slice(0, 3) // Just pass top 3 assets
    };
    
    // Invoke the chain
    console.log('Invoking LangChain processing chain...');
    const startTime = Date.now();
    
    const conversationalContent = await chain.invoke(chainInputs);
    
    console.log(`LangChain processing completed in ${Date.now() - startTime}ms`);
    
    // Extract the asset IDs mentioned in the response for metadata
    const mentionedAssetIds = processedAssets
      .filter(asset => 
        conversationalContent.includes(asset.id) || 
        conversationalContent.includes(asset.name)
      )
      .map(asset => asset.id);
    
    // Return the combined response with metadata
    return new Response(JSON.stringify({
      id: `langchain-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: `${azureInstance}/${azureDeployment}`,
      choices: [{
        message: {
          role: "assistant",
          content: conversationalContent
        },
        finish_reason: "stop",
        index: 0
      }],
      usage: {
        prompt_tokens: -1, // Not available through this method
        completion_tokens: -1, // Not available through this method
        total_tokens: -1 // Not available through this method
      },
      metadata: {
        method: 'asset-search-with-plan',
        query: queryText,
        budget: budget,
        vector_results_count: processedAssets.length,
        mentioned_asset_ids: mentionedAssetIds,
        threshold_used: matchThreshold,
        prompt_type: processedAssets.length === 0 ? "no_results" : "budget_planning",
        using_langchain: true
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