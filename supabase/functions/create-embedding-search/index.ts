
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Validate configuration
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance);
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment);
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');

    if (!azureApiKey || !azureInstance || !azureDeployment || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required configuration');
    }

    // Parse request data
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('A valid query is required');
    }

    console.log('Processing query:', query);

    // Construct the Azure OpenAI endpoint URL
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);

    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: "2023-05-15",
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: azureDeployment
    });

    // Generate embedding for the query
    console.log('Generating embedding for query...');
    const [queryEmbedding] = await embeddings.embedDocuments([query]);
    console.log('Embedding generated successfully');

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Execute the vector similarity search
    console.log('Performing similarity search in database...');
    const { data, error } = await supabaseClient.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 10
    });

    if (error) {
      console.error('Error in similarity search:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} matching documents`);

    return new Response(JSON.stringify({ results: data }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in create-embedding-search function:', error);
    console.error('Error details:', error.stack || 'No stack trace available');
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
