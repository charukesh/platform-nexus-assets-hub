import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";
import { AzureChatOpenAI } from "npm:@langchain/azure-openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "npm:@langchain/core/prompts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureInstance = Deno.env.get('AZURE_OPENAI_API_INSTANCE_NAME');
    const azureDeployment = Deno.env.get('AZURE_OPENAI_API_DEPLOYMENT_NAME');
    const azureEmbeddingDeployment = Deno.env.get('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');
    const azureApiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION') || '2023-05-15';

    // Validate configuration
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_KEY:', azureApiKey ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_INSTANCE_NAME:', azureInstance ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_DEPLOYMENT_NAME:', azureDeployment ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME:', azureEmbeddingDeployment ? '✓ Present' : '✗ Missing');
    console.log('AZURE_OPENAI_API_VERSION:', azureApiVersion ? '✓ Present' : '✗ Missing');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase configuration');
    }

    if (!azureApiKey || !azureInstance || !azureDeployment || !azureEmbeddingDeployment) {
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request data
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    // Accept either 'query' or 'text' parameter
    const queryText = requestData.query || requestData.text;
    const matchCount = requestData.matchCount || 15; // Default to top 15 assets (increased)
    const matchThreshold = requestData.matchThreshold || 0.3; // Increased to 30% similarity

    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }

    // Use the entire query text for embedding (no parsing)
    const searchText = queryText.trim();
    console.log('Using search text for embedding:', searchText);

    // Azure OpenAI setup for embeddings and endpoint
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;
    console.log('Using Azure OpenAI endpoint:', azureEndpoint);

    // Initialize Azure OpenAI embeddings
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIEndpoint: azureEndpoint,
      azureOpenAIApiDeploymentName: azureEmbeddingDeployment,
      modelName: azureEmbeddingDeployment
    });

    // Generate embeddings for the query
    console.log('Generating query embeddings...');
    const [queryEmbedding] = await embeddings.embedDocuments([
      searchText
    ]);
    console.log('Query embeddings generated successfully with length:', queryEmbedding.length);

    // Query database for similar assets using vector search
    console.log('Performing vector similarity search with parameters:');
    console.log('- match_threshold:', matchThreshold, 'type:', typeof matchThreshold);
    console.log('- match_count:', matchCount, 'type:', typeof matchCount);

    // Get enough assets to fulfill request
    console.log('Final match count to use:', matchCount);

    // Ensure parameters have the correct types for PostgreSQL
    const rpcParams = {
      query_embedding: queryEmbedding,
      query_text: searchText,
      match_threshold: parseFloat(matchThreshold.toString()),
      match_count: matchCount
    };

    console.log('Calling match_assets_by_embedding_only with properly typed parameters');
    const { data: matchResults, error: matchError } = await supabaseClient.rpc('match_assets_by_embedding_only', rpcParams);

    if (matchError) {
      console.error('Error in vector similarity search:', matchError);
      throw matchError;
    }

    // Process the results to ensure correct data types
    const matchedAssets = matchResults || [];
    console.log(`Found ${matchedAssets.length} assets via vector similarity`);

    // Process the assets to include essential fields and additional targeting information
    const processedAssets = matchedAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      description: asset.description || "",
      buy_types: asset.buy_types,
      amount: asset.amount !== null ? Number(asset.amount) : null,
      estimated_clicks: Number(asset.estimated_clicks),
      estimated_impressions: Number(asset.estimated_impressions),
      platform_name: asset.platform_name,
      platform_industry: asset.platform_industry,
      category: asset.category,
      placement: asset.placement || "",
      targeting_options: asset.targeting_options || {},
      audience_data: asset.audience_data || {},
      device_split: asset.device_split || {},
      tags: asset.tags || [],
      similarity: Number(asset.similarity).toFixed(2)
    }));

    // Determine prompt type based only on whether we have results
    let promptType = processedAssets.length === 0 ? "no_results" : "budget_planning";

    // Create appropriate prompt based on type
    let promptContent;
    switch (promptType) {
      case "no_results":
        promptContent = `
          Search query: "${queryText}" returned no matching assets.
          
          Provide:
          1. Brief explanation why (1-2 sentences)
          2. 3 alternative queries that might work better
          3. What marketing assets might help (2-3 sentences)
          4. A next step suggestion (1 sentence)
        `;
        break;
      default:
        promptContent = `
          Given search query: "${queryText}", I need to create a relevant marketing plan.
          
          We found ${processedAssets.length} matching assets through semantic search.
          Here's a summary of the top matches:
          ${processedAssets.slice(0, 5).map((asset) => 
            `- ${asset.name} (${asset.platform_name}, ${asset.platform_industry}): Buy type: ${asset.buy_types}, Cost: ${asset.amount}, Est. impressions: ${asset.estimated_impressions}, Est. clicks: ${asset.estimated_clicks}, Category: ${asset.category}${asset.placement ? `, Placement: ${asset.placement}` : ''}${asset.tags && asset.tags.length > 0 ? `, Tags: ${asset.tags.join(', ')}` : ''}`
          ).join('\n')}
          
          IMPORTANT: You must format the marketing plan as a proper markdown table with pipes and dashes for readability.
          
          Please:
          1. First, carefully analyze the query "${queryText}" to identify:
             - Budget requirements
             - Number of assets requested
             - Number of platforms requested
             - Any specific industry filtering instructions (e.g., "only QSR industry")
             - Budget allocation preferences (e.g., "split equally")
             - Specific platforms to include (e.g., "include Facebook and Instagram")
             - Any other filtering criteria for rows (e.g., "only CPC buy type", "only video assets")
             - Targeting requirements:
                * Geographic targeting (e.g., "people from Mumbai", "users in Delhi")
                * Demographic targeting (e.g., "18-24 year olds", "women", "young adults")
                * Interest-based targeting (e.g., "travelers", "food enthusiasts", "gamers")
                * Behavioral targeting (e.g., "frequent shoppers", "new customers")
          
          2. Brief response to the query (2-3 sentences). If the user requested specific requirements you can't fulfill, clearly state this.
          
          3. For each asset in your plan, explain WHY it was chosen and how it meets the user's needs (1-2 sentences per asset). Include relevant targeting options, audience data, or placement details if available.
          
          4. Marketing plan as a properly formatted table:
          
          MARKETING PLAN:
          | Asset | Platform | Platform Industry | Buy Type | Budget % | Cost | Adj. Impressions | Adj. Clicks |
          |-------|----------|-------------------|----------|----------|------|------------------|-------------|
          | [name] | [platform_name] | [platform_industry] | [buy_types] | [%] | [exact cost amount] | [proportional impressions] | [proportional clicks] |
          
          Rules:
          - Use the budget specified in the query (default is 5-8 lakhs if not specified)
          - If specific asset or platform counts are requested, follow those requirements precisely
          - If specific industry filtering is requested, ONLY include assets from that industry
          - If specific platforms are mentioned to include, prioritize those platforms
          - If specific buy types, asset categories, or other criteria are mentioned, filter accordingly
          - PRIORITIZE assets with targeting options that match query requirements (location, age, interests, etc.)
          - Match geographic targeting mentioned in query (cities, states) with appropriate platforms
          - Match demographic targeting mentioned in query (age groups, gender) with suitable assets
          - Match interest or behavioral targeting in query with relevant assets
          - If you don't have enough assets or platforms, use what you have and explain the limitation
          - If query mentions budget allocation like "split equally", follow this precisely
          - Use amount as base cost
          - Ensure % totals 100%
          - Provide EXACT cost amounts for each platform (not percentages)
          - Include the buy type for each asset (from buy_types field)
          - Adjust impressions/clicks proportionally to budget
          - Never include placeholder or "not specified" assets in your plan
          
          5. Brief next steps (1-2 points)
        `;
        break;
    }

    console.log(`Using ${promptType} prompt for Azure OpenAI...`);

    // Initialize the Azure OpenAI chat model using LangChain
    const chatModel = new AzureChatOpenAI({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIEndpoint: azureEndpoint,
      temperature: 0.5,
      maxTokens: 1000
    });

    // Create the chat prompt
    const systemTemplate = `You are a helpful marketing asset assistant. Your job is to help users find the perfect marketing assets for their needs and create actionable marketing plans. Be concise and focused in your recommendations.

When a user provides a query:
1. Look for specific requirements including:
   - Budget information
   - Asset counts ("X assets")
   - Platform counts ("Y platforms")
   - Asset-platform combinations ("X assets from Y platforms")
   - Industry filters ("only QSR industry")
   - Platform inclusions ("include Facebook and Instagram")
   - Buy type preferences ("only CPC")
   - Asset category filters ("only video assets")
   - Targeting options ("only assets with youth targeting")
   - Placement specifications ("only top banner placements")
   - Budget allocation instructions ("split equally", "70% to Facebook")
   - Geographic targeting in the query ("people from Mumbai", "Delhi users")
   - Demographic targeting in the query ("18-24 year olds", "women", "young professionals")
   - Interest-based targeting in the query ("travelers", "food lovers", "tech enthusiasts")
   - Behavioral targeting in the query ("frequent shoppers", "new customers")
2. Pay attention to all available asset properties (targeting_options, audience_data, placement, tags, etc.)
3. ALWAYS present the marketing plan as a properly formatted markdown table with headings, alignment, and proper cell formatting.
4. When users mention specific geographic locations, demographics, interests, or behaviors, prioritize assets with targeting capabilities that match these requirements.
5. Implicitly extract targeting requirements from phrases like "traveling people from Mumbai" (location targeting) or "students aged 18-24" (demographic targeting).

Important:
- If the user requests more assets or platforms than you found, clearly state this limitation
- If they request specific industry filtering (e.g., "only QSR industry"), ONLY include assets from that industry
- Always provide exact amounts in the marketing plan, not just percentages
- If specific platforms are mentioned by name, prioritize those platforms in your plan`;

    const humanTemplate = "{prompt}";
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate)
    ]);

    // Generate the full prompt with input variables
    const formattedPrompt = await chatPrompt.formatMessages({
      prompt: promptContent
    });

    // Invoke the model
    const result = await chatModel.invoke(formattedPrompt);
    const conversationalContent = result.content;

    // Extract the asset IDs mentioned in the response for metadata
    const mentionedAssetIds = processedAssets.filter((asset) =>
      conversationalContent.includes(asset.id) || conversationalContent.includes(asset.name)
    ).map((asset) => asset.id);

    // Log we've received a response and are about to return
    console.log('LLM response received successfully, preparing response...');

    // Return the combined response with metadata
    return new Response(JSON.stringify({
      id: Date.now().toString(),
      object: "chat.completion",
      created: Date.now(),
      model: `${azureInstance}/${azureDeployment}`,
      choices: [
        {
          message: {
            role: "assistant",
            content: conversationalContent
          },
          finish_reason: "stop",
          index: 0
        }
      ],
      metadata: {
        method: 'asset-search-with-plan',
        query: queryText,
        search_terms: searchText,
        vector_results_count: processedAssets.length,
        mentioned_asset_ids: mentionedAssetIds,
        threshold_used: matchThreshold,
        prompt_type: promptType
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in asset search function:', error);
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