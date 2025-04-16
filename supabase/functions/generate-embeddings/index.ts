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
    const requestData = await req.json();
    const { id } = requestData;

    // Validate that we have a valid ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid asset ID provided');
    }

    console.log('Received request to process asset:', id);

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
    const { data: asset, error: fetchError } = await supabaseClient
      .from('assets')
      .select(`
        *,
        platform:platforms(*)
      `)
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
    
    // Check if platform exists - if not, no need to generate embeddings
    if (!asset.platform || !asset.platform.id) {
      console.log('No platform associated with this asset. Skipping embedding generation.');
      return new Response(JSON.stringify({
        success: true,
        message: 'No embedding needed (no platform association)'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('Associated platform:', asset.platform.name);

    // Get Azure OpenAI configuration
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');

    // Log environment variable status (safely without exposing values)
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance);
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment);

    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    // Construct the full Azure OpenAI endpoint URL
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

    // Create a comprehensive content string with all relevant metadata
    let fullContent = '';

    // Append Asset metadata
    fullContent += `
      Name: ${asset.name || ''}
      Category: ${asset.category || ''}
      Description: ${asset.description || ''}
      Type: ${asset.type || ''}
      Tags: ${Array.isArray(asset.tags) ? asset.tags.join(', ') : ''}
      Buy Types: ${asset.buy_types || ''}
      Amount: ${asset.amount || ''}
      Estimated Clicks: ${asset.estimated_clicks || ''}
      Estimated Impressions: ${asset.estimated_impressions || ''}
      Placement: ${asset.placement || ''}
    `;

    // Append Platform metadata
    fullContent += `
      Platform: ${asset.platform.name || ''}
      Industry: ${asset.platform.industry || ''}
      MAU: ${asset.platform.mau || ''}
      DAU: ${asset.platform.dau || ''}
      Premium Users: ${asset.platform.premium_users || ''}
      Audience Data: ${JSON.stringify(asset.platform.audience_data || {})}
      Campaign Data: ${JSON.stringify(asset.platform.campaign_data || {})}
      Device Split: ${JSON.stringify(asset.platform.device_split || {})}
      Restrictions: ${JSON.stringify(asset.platform.restrictions || {})}
    `;
    
    // Clean up the content by removing excessive whitespace
    fullContent = fullContent.replace(/\s+/g, ' ').trim();
    
    console.log('Generating embeddings for asset data...');
    console.log('Content length:', fullContent.length);
    
    if (fullContent.length > 8000) {
      console.log('Content is very long, truncating to 8000 characters...');
      fullContent = fullContent.substring(0, 8000);
    }

    // Generate new embedding with comprehensive context
    const [embeddingVector] = await embeddings.embedDocuments([fullContent]);
    console.log('Embeddings generated successfully');

    // Update the asset with the new embedding
    const { error: updateError } = await supabaseClient
      .from('assets')
      .update({
        embedding: embeddingVector
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating asset with embedding:', updateError);
      throw updateError;
    }

    console.log('Asset updated with new embedding successfully');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Embedding generated and saved successfully'
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