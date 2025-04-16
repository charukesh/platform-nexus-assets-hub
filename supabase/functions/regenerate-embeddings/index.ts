
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');

    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is incomplete');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Initialize Azure OpenAI embeddings
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: "2023-05-15",
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: azureDeployment
    });

    // Fetch all assets with their platform details
    const { data: assets, error: fetchError } = await supabaseClient
      .from('assets')
      .select('*, platform:platforms(*)');

    if (fetchError) throw fetchError;

    console.log(`Found ${assets?.length || 0} assets to process`);

    const results = [];
    
    // Process each asset
    for (const asset of assets || []) {
      try {
        // Create rich content string including platform context
        let content = `${asset.name} ${asset.description || ''} ${asset.type} ${asset.category}`;
        
        if (asset.platform) {
          content += ` Platform: ${asset.platform.name} Industry: ${asset.platform.industry} Audience: ${JSON.stringify(asset.platform.audience_data)} Devices: ${JSON.stringify(asset.platform.device_split)}`;
        }

        // Generate new embedding
        const [embeddingVector] = await embeddings.embedDocuments([content]);
        
        // Update the asset with new embedding
        const { error: updateError } = await supabaseClient
          .from('assets')
          .update({ embedding: embeddingVector })
          .eq('id', asset.id);

        if (updateError) throw updateError;

        results.push({ id: asset.id, status: 'success' });
        console.log(`Successfully updated embedding for asset ${asset.id}`);
      } catch (error) {
        console.error(`Error processing asset ${asset.id}:`, error);
        results.push({ id: asset.id, status: 'error', error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Embedding regeneration complete',
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in regenerate-embeddings function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
