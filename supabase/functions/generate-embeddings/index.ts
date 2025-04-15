
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_INSTANCE');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    const { type, id, content } = await req.json();

    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIEndpoint: `https://${azureInstance}.openai.azure.com`,
      deploymentName: azureDeployment,
      apiVersion: "2023-05-15",
    });

    // Generate embedding using Azure OpenAI
    const [embeddingVector] = await embeddings.embedDocuments([content]);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // If it's an asset, fetch the platform details first
    let fullContent = content;
    if (type === 'asset') {
      const { data: asset } = await supabaseClient
        .from('assets')
        .select('*, platform:platforms(*)')
        .eq('id', id)
        .single();

      if (asset?.platform) {
        fullContent = `${content} ${asset.platform.name} ${asset.platform.industry} ${JSON.stringify(asset.platform.audience_data)} ${JSON.stringify(asset.platform.device_split)}`;
        // Generate new embedding with platform context
        [embeddingVector] = await embeddings.embedDocuments([fullContent]);
      }
    }

    // Update the corresponding record in Supabase
    const table = type === 'platform' ? 'platforms' : 'assets';
    const { error } = await supabaseClient
      .from(table)
      .update({ embedding: embeddingVector })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
