
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text input is required');
    }

    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: Deno.env.get('AZURE_OPENAI_API_KEY'),
      azureOpenAIApiVersion: Deno.env.get('AZURE_OPENAI_EMBEDDING_API_VERSION'),
      azureOpenAIApiInstanceName: Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME'),
      azureOpenAIApiDeploymentName: Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME'),
    });

    const [embedding] = await embeddings.embedDocuments([text]);

    return new Response(
      JSON.stringify({ embedding }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-embedding-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
