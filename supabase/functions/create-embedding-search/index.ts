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
    const matchCount = requestData.matchCount || 3; // Default to top 3 assets
    const matchThreshold = requestData.matchThreshold || 0.75; // Threshold for similarity

    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }
    
    // Parse the query to extract core search terms and requirements
    const queryInfo = parseMarketingQuery(queryText);
    console.log('Parsed query info:', queryInfo);
    
    // Use core search terms for embedding to improve search relevance
    // If no core terms could be extracted, fall back to the original query
    const searchText = queryInfo.coreSearchTerms && queryInfo.coreSearchTerms.trim() !== '' 
                      ? queryInfo.coreSearchTerms 
                      : queryText;

    console.log('Original query:', queryText);
    console.log('Using search terms for embedding:', searchText);

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

    // Check if the user requested specific numbers of assets or platforms
    const requestedAssetCount = queryInfo.assetCount || matchCount;
    const requestedPlatformCount = queryInfo.platformCount;
    const assetPlatformCombination = queryInfo.combination;
    
    // Get enough assets to fulfill request, with some buffer for filtering
    const finalMatchCount = Math.max(requestedAssetCount * 2, matchCount);
    
    console.log('Requested asset count:', requestedAssetCount);
    console.log('Requested platform count:', requestedPlatformCount);
    if (assetPlatformCombination) {
      console.log('Requested asset-platform combination:', 
                 `${assetPlatformCombination.assets} assets from ${assetPlatformCombination.platforms} platforms`);
    }
    console.log('Final match count to use:', finalMatchCount);

    // Ensure parameters have the correct types for PostgreSQL
    const rpcParams = {
      query_embedding: queryEmbedding,
      match_threshold: parseFloat(matchThreshold.toString()),
      match_count: finalMatchCount // Use the potentially increased match count
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

    // Process the assets to include only essential fields to reduce payload size
    // This minimizes data sent to the LLM to improve performance
    const processedAssets = matchedAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      buy_types: asset.buy_types,
      amount: asset.amount !== null ? Number(asset.amount) : null,
      estimated_clicks: Number(asset.estimated_clicks),
      estimated_impressions: Number(asset.estimated_impressions),
      platform_name: asset.platform_name,
      platform_industry: asset.platform_industry,
      category: asset.category,
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
          Given search query: "${queryText}", I've analyzed it to understand the user's specific marketing needs:
          
          Product/Brand: ${queryInfo.product || "Not specified"}
          Marketing Objective: ${queryInfo.objective || "Not specified"}
          Budget: ${queryInfo.budget || "5-8 lakhs"}
          Asset Count Requested: ${queryInfo.assetCount || "Not specified"}
          Platform Count Requested: ${queryInfo.platformCount || "Not specified"}
          Budget Allocation: ${queryInfo.budgetAllocation === "equal" ? "Equal split" : "Proportional allocation"}
          
          We found ${processedAssets.length} matching assets through semantic search.
          Here's a summary of the top matches:
          ${processedAssets.slice(0, 5).map(asset => 
            `- ${asset.name} (${asset.platform_name}, ${asset.platform_industry}): Buy type: ${asset.buy_types}, Cost: ${asset.amount}, Est. impressions: ${asset.estimated_impressions}, Est. clicks: ${asset.estimated_clicks}`
          ).join('\n')}
          
          Include:
          1. Brief response to the query (2-3 sentences). If the user requested more assets or specific platform counts that you can't fulfill, clearly state this.
          2. For each asset in your plan, explain WHY it was chosen and how it meets the user's needs (1-2 sentences per asset)
          3. Marketing plan as:
          
          MARKETING PLAN:
          Asset,Platform,Platform Industry,Buy Type,Budget %,Cost,Adj. Impressions,Adj. Clicks
          [name],[platform_name],[platform_industry],[buy_types],[%],[exact cost amount],[proportional impressions],[proportional clicks]
          
          Rules:
          - Use the specified budget: ${queryInfo.budget || "5-8 lakhs"}
          - If user requested ${queryInfo.assetCount || "N/A"} assets, use exactly that number if possible
          - If user requested ${queryInfo.platformCount || "N/A"} platforms, select assets from exactly that many unique platforms
          - If you don't have enough assets or platforms, use what you have and explain the limitation
          - If budget allocation is "${queryInfo.budgetAllocation}", follow this precisely
          - Use amount as base cost
          - Ensure % totals 100%
          - Provide EXACT cost amounts for each platform (not percentages)
          - Include the buy type for each asset (from buy_types field)
          - Adjust impressions/clicks proportionally to budget
          - Never include placeholder or "not specified" assets in your plan
          
          4. Brief next steps (1-2 points)
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
1. Extract any budget information mentioned. If no budget is specified, assume a default budget of 5-8 lakhs.
2. Look for specific requirements regarding asset and platform combinations:
   - "X assets" - They want exactly X assets total
   - "Y platforms" - They want assets from exactly Y platforms
   - "X assets from Y platforms" - They want X assets distributed across Y platforms
3. Check for budget allocation instructions (e.g., "split equally", "70% to Facebook").
4. Identify any specific product, brand or campaign needs.
5. Pay attention to the buy type for each asset (from buy_types field) as this is important for the marketing plan.

Important:
- If the user requests more assets or platforms than you found, clearly state this limitation in your response
- If they request "X assets from Y platforms", prioritize fulfilling both requirements if possible
- Never include placeholder or "Not specified" assets in your plan
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
    const mentionedAssetIds = processedAssets
      .filter((asset) => conversationalContent.includes(asset.id) || conversationalContent.includes(asset.name))
      .map((asset) => asset.id);

    // Log we've received a response and are about to return
    console.log('LLM response received successfully, preparing response...');

    // Return the combined response with metadata
    return new Response(JSON.stringify({
      id: Date.now().toString(), // Since we don't have the direct OpenAI response ID
      object: "chat.completion",
      created: Date.now(),
      model: `${azureInstance}/${azureDeployment}`,
      choices: [{
        message: {
          role: "assistant",
          content: conversationalContent
        },
        finish_reason: "stop",
        index: 0
      }],
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

/**
 * Parses a marketing query to extract core search terms and requirements
 * @param {string} query - The user's search query
 * @returns {Object} - Object containing parsed query information
 */
function parseMarketingQuery(query) {
  if (!query || typeof query !== 'string') {
    return {
      originalQuery: "",
      coreSearchTerms: "",
      product: null,
      objective: null,
      budget: "5-8 lakhs",
      assetCount: null,
      platformCount: null,
      combination: null,
      budgetAllocation: "proportional"
    };
  }
  
  try {
    // Extract product/brand
    const productMatch = query.match(/(?:for|promoting)\s+([a-z0-9\s]+?)(?:,|\s+to\s+|$)/i);
    const product = productMatch ? productMatch[1].trim() : null;
    
    // Extract objective
    const objectiveMatch = query.match(/to\s+(?:increase|improve|boost|enhance|maximize)\s+([a-z0-9\s]+?)(?:,|$)/i);
    const objective = objectiveMatch ? objectiveMatch[1].trim() : null;
    
    // Extract budget
    const budgetMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|L|cr|crore|k|K|thousand)/i);
    const budget = budgetMatch ? budgetMatch[0] : "5-8 lakhs"; // Default
    
    // Extract asset count
    const assetMatch = query.match(/(\d+)\s*(?:asset|ad)s?/i);
    const assetCount = assetMatch ? parseInt(assetMatch[1], 10) : null;
    
    // Extract platform count
    const platformMatch = query.match(/(\d+)\s*(?:platform|channel)s?/i);
    const platformCount = platformMatch ? parseInt(platformMatch[1], 10) : null;
    
    // Extract asset-platform combination
    const combinationMatch = query.match(/(\d+)\s*(?:asset|ad)s?\s*(?:from|on)\s*(\d+)\s*(?:platform|channel)/i);
    const combination = combinationMatch ? {
      assets: parseInt(combinationMatch[1], 10),
      platforms: parseInt(combinationMatch[2], 10)
    } : null;
    
    // Extract budget allocation
    const equalBudgetMatch = /(equal|split|same|even)\s*budget/i.test(query);
    const budgetAllocation = equalBudgetMatch ? "equal" : "proportional";
    
    // Construct core search terms (for embedding)
    let coreTerms = [];
    if (product) coreTerms.push(product);
    if (objective) coreTerms.push(`increase ${objective}`);
    
    // If we couldn't extract specific terms, use keywords from the query
    const keywordExtractionRegex = /\b((?!budget|asset|platform|channel|lakh|lac|cr|crore|k|split|equal|from|on)[a-z]{3,})\b/gi;
    const extractedKeywords = query.match(keywordExtractionRegex) || [];
    
    if (coreTerms.length === 0 && extractedKeywords.length > 0) {
      // Use top 3-5 keywords as fallback
      coreTerms = extractedKeywords.slice(0, 5);
    }
    
    // Final fallback - use the full query if nothing else works
    const coreSearchTerms = coreTerms.length > 0 ? coreTerms.join(' ') : query;
    
    return {
      originalQuery: query,
      coreSearchTerms,
      product,
      objective,
      budget,
      assetCount,
      platformCount,
      combination,
      budgetAllocation
    };
  } catch (error) {
    console.error("Error parsing marketing query:", error);
    // Return a safe default if parsing fails
    return {
      originalQuery: query,
      coreSearchTerms: query, // Use original query as fallback
      product: null,
      objective: null,
      budget: "5-8 lakhs",
      assetCount: null,
      platformCount: null,
      combination: null,
      budgetAllocation: "proportional"
    };
  }
}