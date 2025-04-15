import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Helper function to format JSON fields
function formatJsonField(jsonField: any): string {
  if (!jsonField) return '';
  
  try {
    if (typeof jsonField === 'string') {
      return jsonField;
    }
    
    // Pretty format the JSON with important key-value pairs
    return Object.entries(jsonField)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  } catch (error) {
    console.warn('Error formatting JSON field:', error);
    return JSON.stringify(jsonField);
  }
}

// Function to generate enhanced asset embedding with structured content
async function generateEnhancedAssetEmbedding(
  supabaseClient: any, 
  embeddings: any, 
  id: string, 
  content: string
) {
  console.log('Fetching asset with platform details...');
  
  // Fetch the asset with its platform details
  const { data: asset, error: fetchError } = await supabaseClient
    .from('assets')
    .select('*, platform:platforms(*)')
    .eq('id', id)
    .single();

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
  
  // Create a structured, rich content for embedding
  let structuredContent = '';
  
  // Add asset core information
  structuredContent += `Asset ID: ${asset.id}\n`;
  structuredContent += `Asset Name: ${asset.name}\n`;
  structuredContent += `Asset Type: ${asset.type}\n`;
  structuredContent += `Asset Category: ${asset.category}\n`;
  
  if (asset.description) {
    structuredContent += `Description: ${asset.description}\n`;
  }
  
  if (asset.tags && Array.isArray(asset.tags)) {
    structuredContent += `Tags: ${asset.tags.join(', ')}\n`;
  }
  
  // Add original content
  structuredContent += `Content: ${content}\n`;
  
  // Add platform information if available
  if (asset.platform) {
    structuredContent += `\nPlatform Information:\n`;
    structuredContent += `Platform Name: ${asset.platform.name}\n`;
    structuredContent += `Industry: ${asset.platform.industry}\n`;
    
    if (asset.platform.audience_data) {
      structuredContent += `Audience Data: ${formatJsonField(asset.platform.audience_data)}\n`;
    }
    
    if (asset.platform.device_split) {
      structuredContent += `Device Split: ${formatJsonField(asset.platform.device_split)}\n`;
    }
    
    if (asset.platform.campaign_data) {
      structuredContent += `Campaign Data: ${formatJsonField(asset.platform.campaign_data)}\n`;
    }
    
    if (asset.platform.restrictions) {
      structuredContent += `Restrictions: ${formatJsonField(asset.platform.restrictions)}\n`;
    }
    
    // Add user metrics if available
    if (asset.platform.dau || asset.platform.mau || asset.platform.premium_users) {
      structuredContent += `User Metrics:\n`;
      if (asset.platform.dau) structuredContent += `- Daily Active Users: ${asset.platform.dau}\n`;
      if (asset.platform.mau) structuredContent += `- Monthly Active Users: ${asset.platform.mau}\n`;
      if (asset.platform.premium_users) structuredContent += `- Premium Users: ${asset.platform.premium_users}\n`;
    }
  }

  console.log('Structured content prepared for embedding');
  console.log('Content sample:', structuredContent.substring(0, 200) + '...');
  
  // Generate new embedding with structured content
  console.log('Generating embeddings for structured content...');
  const [embeddingVector] = await embeddings.embedDocuments([structuredContent]);
  
  console.log('Embeddings generated successfully');
  
  return {
    embeddingVector,
    structuredContent
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    // Log environment variable status
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance);
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment);
    
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    
    // Parse request data
    const requestData = await req.json();
    const { id, content } = requestData;
    
    // Validate input
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid asset ID provided');
    }
    
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided');
    }
    
    console.log('Received request to generate embeddings for asset:', id);
    
    // Construct Azure OpenAI endpoint URL
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
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is incomplete');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Generate enhanced embeddings
    const { embeddingVector, structuredContent } = await generateEnhancedAssetEmbedding(
      supabaseClient, 
      embeddings, 
      id, 
      content
    );
    
    // Update the asset with the new embedding
    const { error: updateError } = await supabaseClient
      .from('assets')
      .update({
        embedding: embeddingVector,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating asset with embedding:', updateError);
      throw updateError;
    }
    
    console.log('Asset updated with new embedding successfully');
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Embedding generated and asset updated successfully',
      contentLength: structuredContent.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    console.error('Error details:', error.stack || 'No stack trace available');
    
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});