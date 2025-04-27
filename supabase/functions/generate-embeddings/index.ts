import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Function to build searchable content that aligns with our SQL hybrid search approach
const buildSearchableContent = (asset)=>{
  // Asset core information - align with SQL immutable_tsvector_concat function
  const assetContent = [
    asset.name || '',
    asset.description || '',
    asset.category || '',
    Array.isArray(asset.tags) ? asset.tags.join(' ') : ''
  ].join(' ');
  // Platform core information
  const platformContent = asset.platform ? [
    asset.platform.name || '',
    asset.platform.industry || ''
  ].join(' ') : '';
  // Extract and enhance targeting data for better searchability
  let targetingContent = '';
  if (asset.platform && asset.platform.audience_data) {
    // Parse audience_data if it's a string
    const audienceData = typeof asset.platform.audience_data === 'string' ? JSON.parse(asset.platform.audience_data) : asset.platform.audience_data;
    // Geographic targeting - explicitly extract location values for search
    const geoTerms = [];
    // State targeting
    if (audienceData.state_level_targeting) {
      geoTerms.push('state targeting');
      if (audienceData.state_targeting_values) {
        // Split state values if it's a comma-separated list, otherwise use as is
        const stateValues = audienceData.state_targeting_values.includes(',') ? audienceData.state_targeting_values.split(',').map((s)=>s.trim()) : [
          audienceData.state_targeting_values.trim()
        ];
        // Add each state as a separate term and also joined
        geoTerms.push(...stateValues);
        geoTerms.push(`states: ${stateValues.join(' ')}`);
      }
    }
    // City targeting
    if (audienceData.city_level_targeting) {
      geoTerms.push('city targeting');
      if (audienceData.city_targeting_values) {
        // Split city values if it's a comma-separated list, otherwise use as is
        const cityValues = audienceData.city_targeting_values.includes(',') ? audienceData.city_targeting_values.split(',').map((s)=>s.trim()) : [
          audienceData.city_targeting_values.trim()
        ];
        // Add each city as a separate term and also joined
        geoTerms.push(...cityValues);
        geoTerms.push(`cities: ${cityValues.join(' ')}`);
      }
    }
    // Demographic targeting
    const demoTerms = [];
    // Age targeting
    if (audienceData.age_targeting_available) {
      demoTerms.push('age targeting');
      if (audienceData.age_groups && typeof audienceData.age_groups === 'object') {
        const ageGroups = Object.keys(audienceData.age_groups).filter((key)=>audienceData.age_groups[key] === true || audienceData.age_groups[key] === 'true' || audienceData.age_groups[key] === 1);
        if (ageGroups.length > 0) {
          demoTerms.push(`age groups: ${ageGroups.join(' ')}`);
          demoTerms.push(...ageGroups);
        }
      }
    }
    // Gender targeting
    if (audienceData.gender_targeting_available) {
      demoTerms.push('gender targeting');
      if (audienceData.gender && typeof audienceData.gender === 'object') {
        const genderGroups = Object.keys(audienceData.gender).filter((key)=>audienceData.gender[key] === true || audienceData.gender[key] === 'true' || audienceData.gender[key] === 1);
        if (genderGroups.length > 0) {
          demoTerms.push(`gender: ${genderGroups.join(' ')}`);
          demoTerms.push(...genderGroups);
        }
      }
    }
    // Interest targeting
    const interestTerms = [];
    if (Array.isArray(audienceData.interests) && audienceData.interests.length > 0) {
      interestTerms.push('interest targeting');
      interestTerms.push(`interests: ${audienceData.interests.join(' ')}`);
      interestTerms.push(...audienceData.interests);
    }
    // Platform-specific targeting
    const platformSpecificTerms = [];
    if (Array.isArray(audienceData.platform_specific_targeting) && audienceData.platform_specific_targeting.length > 0) {
      platformSpecificTerms.push('platform specific targeting');
      platformSpecificTerms.push(...audienceData.platform_specific_targeting);
    }
    // Combine all targeting terms
    targetingContent = [
      ...geoTerms,
      ...demoTerms,
      ...interestTerms,
      ...platformSpecificTerms
    ].join(' ');
  }
  // Additional context that might help with semantic understanding
  const extendedContent = [
    `Buy Types: ${asset.buy_types || ''}`,
    `Amount: ${asset.amount || ''}`,
    `Placement: ${asset.placement || ''}`,
    asset.platform ? `MAU: ${asset.platform.mau || ''}` : '',
    asset.platform ? `DAU: ${asset.platform.dau || ''}` : '',
    // Include device split data
    asset.platform && asset.platform.device_split ? `Devices: ${JSON.stringify(asset.platform.device_split)}` : '',
    // Include campaign data
    asset.platform && asset.platform.campaign_data ? `Campaign: ${JSON.stringify(asset.platform.campaign_data)}` : '',
    // Add targeting content as a separate section
    targetingContent ? `Targeting: ${targetingContent}` : ''
  ].filter((item)=>item).join(' ');
  // Combine with priority on the core content that matches our SQL function
  return `${assetContent} ${platformContent} ${extendedContent}`.replace(/\s+/g, ' ').trim();
};
serve(async (req)=>{
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
    const { data: asset, error: fetchError } = await supabaseClient.from('assets').select(`
        *,
        platform:platforms(*)
      `).eq('id', id).single();
    if (fetchError) {
      console.error('Error fetching asset:', fetchError);
      throw fetchError;
    }
    if (!asset) {
      console.error('Asset not found with ID:', id);
      throw new Error('Asset not found');
    }
    console.log('Asset fetched successfully:', asset.id);
    // Check if platform exists - if not, still generate embeddings but note it
    if (!asset.platform || !asset.platform.id) {
      console.log('No platform associated with this asset. Will generate embedding with asset data only.');
    } else {
      console.log('Associated platform:', asset.platform.name);
    }
    // Get Azure OpenAI configuration
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION') || "2023-05-15";
    // Log environment variable status (safely without exposing values)
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance);
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureDeployment);
    console.log('AZURE_OPENAI_API_VERSION:', azureApiVersion);
    if (!azureApiKey || !azureInstance || !azureDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }
    // Construct the full Azure OpenAI endpoint URL
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);
    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureDeployment,
      modelName: azureDeployment
    });
    // Use our structured function to build the content for embedding
    const fullContent = buildSearchableContent(asset);
    console.log('Generating embeddings for asset data...');
    console.log('Content length:', fullContent.length);
    if (fullContent.length > 8000) {
      console.log('Content is very long, truncating to 8000 characters...');
      // Truncate but try to preserve complete words
      const truncated = fullContent.substring(0, 8000);
      // Find the last space before the cutoff
      const lastSpace = truncated.lastIndexOf(' ');
      // Use lastSpace if it's reasonably close to the cutoff, otherwise use the full truncation
      const finalContent = lastSpace > 7500 ? truncated.substring(0, lastSpace) : truncated;
      console.log(`Truncated to ${finalContent.length} characters`);
    }
    // Generate new embedding with comprehensive context
    const [embeddingVector] = await embeddings.embedDocuments([
      fullContent
    ]);
    console.log('Embeddings generated successfully with length:', embeddingVector.length);
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
      success: true,
      message: 'Embedding generated and saved successfully',
      asset_id: id,
      embedding_length: embeddingVector.length,
      content_length: fullContent.length
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
