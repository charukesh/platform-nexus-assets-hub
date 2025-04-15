
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
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    // Log environment variable status (safely without exposing values)
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey);
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance);
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment);
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    const requestData = await req.json();
    const { id, content } = requestData;
    // Validate that we have a valid UUID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid asset ID provided');
    }
    console.log('Received request to generate embeddings for asset:', id);
    console.log('Content for embedding:', content);
    // Construct the full Azure OpenAI endpoint URL
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    // Initialize Azure OpenAI embeddings with correct configuration
    // Replace the embeddings initialization in your Deno code with this:
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: "2023-05-15",
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: azureDeployment // Added modelName parameter
    });
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is incomplete');
    }
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    // Fetch the asset with its platform details
    const { data: asset, error: fetchError } = await supabaseClient.from('assets').select('*, platform:platforms(*)').eq('id', id).single();
    if (fetchError) {
      console.error('Error fetching asset:', fetchError);
      throw fetchError;
    }
    if (!asset) {
      console.error('Asset not found with ID:', id);
      throw new Error('Asset not found');
    }
    console.log('Asset fetched successfully:', asset.id);
    console.log('Associated platform:', asset.platform ? asset.platform.name : 'None');
    // Create a rich content string including platform context if available
    let fullContent = content;
    if (asset.platform) {
      fullContent = `${content} Platform: ${asset.platform.name} Industry: ${asset.platform.industry} Audience: ${JSON.stringify(asset.platform.audience_data)} Devices: ${JSON.stringify(asset.platform.device_split)}`;
      console.log('Enhanced content with platform data');
    }
    console.log('Generating embeddings for content...');
    // Generate new embedding with platform context
    const [embeddingVector] = await embeddings.embedDocuments([
      fullContent
    ]);
    console.log('Embeddings generated successfully');
    // Update the asset with the new embedding
    const { error: updateError } = await supabaseClient.from('assets').update({
      embedding: embeddingVector
    }).eq('id', id);
    if (updateError) {
      console.error('Error updating asset with embedding:', updateError);
      throw updateError;
    }
    console.log('Asset updated with new embedding successfully');
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
