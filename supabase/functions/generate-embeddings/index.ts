import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_INSTANCE');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');
    // Log environment variable status (safely without exposing values)
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_INSTANCE:', azureInstance ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_DEPLOYMENT:', azureDeployment ? '✓ Present' : '✗ Missing');
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    const { id, content } = await req.json();
    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: '2023-05-15',
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: "text-embedding-ada-002",
    });

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Fetch the asset with its platform details
    const { data: asset, error: fetchError } = await supabaseClient.from('assets').select('*, platform:platforms(*)').eq('id', id).single();
    if (fetchError) throw fetchError;
    if (!asset) throw new Error('Asset not found');
    // Create a rich content string including platform context if available
    let fullContent = content;
    if (asset.platform) {
      fullContent = `${content} Platform: ${asset.platform.name} Industry: ${asset.platform.industry} Audience: ${JSON.stringify(asset.platform.audience_data)} Devices: ${JSON.stringify(asset.platform.device_split)}`;
    }
    // Generate new embedding with platform context
    const [embeddingVector] = await embeddings.embedDocuments([
      fullContent
    ]);
    // Update the asset with the new embedding
    const { error: updateError } = await supabaseClient.from('assets').update({
      embedding: embeddingVector
    }).eq('id', id);
    if (updateError) throw updateError;
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
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
