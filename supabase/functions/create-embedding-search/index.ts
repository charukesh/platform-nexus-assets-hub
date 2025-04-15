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
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    
    // Validate configuration
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment ? '✓ Present' : '✗ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase configuration');
    }
    
    // Parse request data
    const requestData = await req.json();
    const { 
      query, 
      threshold = 0.5, 
      count = 10, 
      category = null, 
      platformId = null,
      useEmbedding = true 
    } = requestData;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('A valid query is required');
    }
    
    console.log('Processing query:', query);
    console.log('Search parameters:', { threshold, count, category, platformId, useEmbedding });
    
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // If using text-based search (no embeddings)
    if (!useEmbedding) {
      console.log('Performing text-based search...');
      
      const { data, error } = await supabaseClient.rpc('match_assets_by_text', {
        query_text: query,
        match_count: count,
        filter_category: category,
        filter_platform_id: platformId
      });
      
      if (error) {
        console.error('Error in text search:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} matching assets via text search`);
      
      return new Response(JSON.stringify({ 
        results: data || [],
        method: 'text',
        query: query
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // For embedding-based search, check if Azure OpenAI is configured
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      console.warn('Azure OpenAI configuration is incomplete, falling back to text search');
      
      const { data, error } = await supabaseClient.rpc('match_assets_by_text', {
        query_text: query,
        match_count: count,
        filter_category: category,
        filter_platform_id: platformId
      });
      
      if (error) {
        console.error('Error in fallback text search:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} matching assets via fallback text search`);
      
      return new Response(JSON.stringify({ 
        results: data || [],
        method: 'text-fallback',
        query: query
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Set up Azure OpenAI embeddings
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: "2023-05-15",
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: azureDeployment
    });
    
    // Generate embedding for query
    console.log('Generating embedding for query text...');
    
    const [queryEmbedding] = await embeddings.embedDocuments([query]);
    console.log('Query embedding generated successfully');
    
    // Execute the vector similarity search
    console.log('Performing vector similarity search in database...');
    
    const { data, error } = await supabaseClient.rpc('match_assets_by_embedding', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: count,
      filter_category: category,
      filter_platform_id: platformId
    });
    
    if (error) {
      console.error('Error in vector similarity search:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} matching assets`);
    
    // Enhance results with additional context if needed
    const enhancedResults = data?.map(item => ({
      ...item,
      relevance_score: Math.round(item.similarity * 100) / 100
    })) || [];
    
    // Return the results
    return new Response(JSON.stringify({ 
      results: enhancedResults,
      method: 'vector',
      query: query
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in vector-search function:', error);
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