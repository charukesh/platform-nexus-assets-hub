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

    // Accept either 'query' or 'text' parameter
    const queryText = requestData.query || requestData.text;
    // Increased from 5 to 10 as requested
    const matchCount = requestData.matchCount || 10; 
    const matchThreshold = requestData.matchThreshold || 0.6;

    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }

    // Use the entire query text for embedding (no parsing)
    const searchText = queryText.trim();

    // Azure OpenAI setup for embeddings and endpoint
    const azureEndpoint = `https://${azureInstance}.openai.azure.com`;

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
    const [queryEmbedding] = await embeddings.embedDocuments([searchText]);

    // Ensure parameters have the correct types for PostgreSQL
    const rpcParams = {
      query_embedding: queryEmbedding,
      query_text: searchText,
      match_threshold: parseFloat(matchThreshold.toString()),
      match_count: matchCount // Now retrieving 10 matches instead of 5
    };

    // Query database for similar assets using vector search
    const { data: matchResults, error: matchError } = await supabaseClient.rpc('match_assets_by_embedding_only', rpcParams);
    
    if (matchError) {
      throw matchError;
    }

    // Process the results to ensure correct data types
    const matchedAssets = matchResults || [];

    // Helper function to safely extract targeting options from platform.restrictions
    function extractTargetingOptions(data) {
      // If null or undefined, return empty object
      if (!data) return {};
      
      // If it's a string, try to parse as JSON
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Error parsing targeting options:', e);
          return {};
        }
      }
      
      // If it's already an object, return it
      return data;
    }

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
      // Extract targeting options from platform_audience_data
      targeting_options: extractTargetingOptions(asset.platform_audience_data),
      audience_data: typeof asset.platform_audience_data === 'string' ? JSON.parse(asset.platform_audience_data || '{}') : asset.platform_audience_data || {},
      device_split: typeof asset.platform_device_split === 'string' ? JSON.parse(asset.platform_device_split || '{}') : asset.platform_device_split || {},
      tags: asset.tags || [],
      similarity: Number(asset.similarity).toFixed(2)
    }));

    console.log("processedAssets ===> " + JSON.stringify(processedAssets));

    // Determine prompt type based only on whether we have results
    let promptType = processedAssets.length === 0 ? "no_results" : "budget_planning";

    // Create appropriate prompt based on type
    let promptContent;
    
    switch(promptType) {
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
          Here's a summary of the matches:
          ${processedAssets.map((asset) => {
            // Extract geographic targeting capabilities for clearer presentation
            const targetingOpts = asset.targeting_options || {};
            const geoTargeting = {
              // Handle both boolean flags and values for targeting options
              cityLevelAvailable: !!targetingOpts.city_level_targeting,
              stateLevelAvailable: !!targetingOpts.state_level_targeting,
              stateValues: typeof targetingOpts.state_targeting_values === 'string' ? targetingOpts.state_targeting_values : '',
              ageTargetingAvailable: !!targetingOpts.age_targeting_available,
              genderTargetingAvailable: !!targetingOpts.gender_targeting_available,
              // Additional fields that might contain values
              cityValues: typeof targetingOpts.city_targeting_values === 'string' ? targetingOpts.city_targeting_values : '',
              ageGroups: targetingOpts.age_groups || {},
              genderValues: targetingOpts.gender || {},
              interests: Array.isArray(targetingOpts.interests) ? targetingOpts.interests : []
            };
            
            return `- ${asset.name} (${asset.platform_name}, ${asset.platform_industry}): 
              ID: ${asset.id}
              Buy type: ${asset.buy_types}
              Base cost: ${asset.amount}
              Est. impressions: ${asset.estimated_impressions}
              Est. clicks: ${asset.estimated_clicks}
              Category: ${asset.category}${asset.placement ? `\n              Placement: ${asset.placement}` : ''}
              Audience & Targeting: ${geoTargeting.stateLevelAvailable ? 'State-level targeting available' : 'No state targeting'}${geoTargeting.stateValues ? ` (States: ${geoTargeting.stateValues})` : ''}${geoTargeting.cityLevelAvailable ? ', City-level targeting available' : ', No city targeting'}${geoTargeting.cityValues ? ` (Cities: ${geoTargeting.cityValues})` : ''}
              Demographics: ${geoTargeting.ageTargetingAvailable ? 'Age targeting available' : 'No age targeting'}${Object.keys(geoTargeting.ageGroups).length > 0 ? ` (Age groups: ${JSON.stringify(geoTargeting.ageGroups)})` : ''}${geoTargeting.genderTargetingAvailable ? ', Gender targeting available' : ', No gender targeting'}${Object.keys(geoTargeting.genderValues).length > 0 ? ` (Gender: ${JSON.stringify(geoTargeting.genderValues)})` : ''}
              Interests: ${geoTargeting.interests.length > 0 ? `Available (Interests: ${geoTargeting.interests.join(', ')})` : 'No interest targeting'}
              Full audience data: ${JSON.stringify(asset.targeting_options)}
              Device split: ${JSON.stringify(asset.device_split)}${asset.tags && asset.tags.length > 0 ? `\n              Tags: ${asset.tags.join(', ')}` : ''}
              Similarity: ${asset.similarity}`;
          }).join('\n\n')}
          
          IMPORTANT: You must format the marketing plan as a proper markdown table with pipes and dashes for readability.
          
          Please:
          1. First, carefully analyze the query "${queryText}" to identify:
            - Budget requirements
            - Number of assets requested
            - Number of platforms requested
            - Any specific industry filtering instructions (e.g., "only tech industry", "only finance industry")
            - Budget allocation preferences (e.g., "split equally")
            - Specific platforms to include (e.g., "include Facebook and Instagram")
            - Any other filtering criteria for rows (e.g., "only CPC buy type", "only video assets")
            - Targeting requirements:
                * Geographic targeting (e.g., "people from Mumbai", "users in Delhi") - IDENTIFY ALL STATES, CITIES, AND COUNTRIES
                * Demographic targeting (e.g., "18-24 year olds", "women", "young adults")
                * Interest-based targeting (e.g., "travelers", "food enthusiasts", "gamers")
                * Behavioral targeting (e.g., "frequent shoppers", "new customers")
          
          2. Brief response to the query (2-3 sentences). If the user requested specific requirements you can't fulfill, clearly state this.
          
          3. PLATFORM SELECTION AND ASSETS:
             For each selected platform, explain why it's ideal for the campaign and what specific assets within it work best:
             
             **[Platform Name] - [X]% of total budget (₹[exact amount])**
             
             **Why [Platform Name] makes sense:**
             * [Point 1]: Focus on how the target audience uses this platform (e.g., "Your audience (developers aged 22-35) are often plugged in with music or podcasts — it's their second screen during coding")
             * [Point 2]: Highlight the platform's unique storytelling or engagement capabilities (e.g., "Audio + banners allow for emotional, witty storytelling")
             * [Point 3]: Detail the platform's specific targeting advantages (e.g., "Targeting by age, location, language, and even interests like tech podcasts is precise")
             * [Brief emotional/strategic summary]: One-line emotional or strategic benefit (e.g., "Emotionally resonant + perfect brand storytelling + urban professional audience")
             
             **Within [Platform Name], we'll leverage:**
             * **[Asset Name] - [X]% of platform budget (₹[exact amount])**: [Brief explanation of why this specific asset within the platform]
             * **[Asset Name] - [X]% of platform budget (₹[exact amount])**: [Brief explanation of why this specific asset within the platform]
             
             With this platform allocation, we expect [X] impressions and [Y] clicks based on our calculations: [show brief calculation example]
          
          4. Marketing plan as a properly formatted table:
          
          MARKETING PLAN:
          | Asset | Platform | Platform Industry | Buy Type | Budget % | Budget Amount | Est. Impressions | Est. Clicks |
          |-------|----------|-------------------|----------|----------|---------------|------------------|-------------|
          | [name] | [platform_name] | [platform_industry] | [buy_types] | [%] | [calculated budget amount] | [proportional impressions] | [proportional clicks] |
          
          CRITICAL CALCULATION INSTRUCTIONS FOR IMPRESSIONS AND CLICKS:
          - You MUST show your calculations for at least one example to demonstrate how you derived the values
          - Formula for impressions: (asset.estimated_impressions) × (budget_percentage / 100)
          - Formula for clicks: (asset.estimated_clicks) × (budget_percentage / 100)
          - Example calculation: "For Asset X with base 50,000 impressions receiving 30% of budget: 50,000 × (30/100) = 15,000 adjusted impressions"
          - Use the exact base values from the asset data and show adjusted values in the table
          
          5. CRITICAL: EXPLAIN IN DETAIL (4-5 sentences) the rationale behind your budget allocation. For example:
             - Why did you allocate more budget to certain assets?
             - What factors influenced your budget split decision? (targeting capabilities, performance metrics, etc.)
             - How does this allocation optimize for the query's goals?
             - How will this split maximize ROI based on the estimated impressions and clicks?
          
          6. CRITICAL: Impression and click calculations MUST be done as follows:
             - Calculate impressions using exact formula: (asset.estimated_impressions / asset.amount) × allocated_budget_amount
             - Calculate clicks using exact formula: (asset.estimated_clicks / asset.amount) × allocated_budget_amount
             - Show complete calculations with actual numbers for at least one asset as an example
             - For example: "Asset X with 75,000 base impressions at base cost ₹250,000 receiving ₹400,000 budget: 
               (75,000 / 250,000) × 400,000 = 120,000 adjusted impressions"
             - Include similar calculation demonstration for clicks
             - Show these accurately calculated numbers in the Est. Impressions and Est. Clicks columns
             - Do not round or approximate these calculations - use exact mathematical results
          
          Rules:
          - Use the budget specified in the query (default is 5-8 lakhs if not specified)
          - If specific asset or platform counts are requested, follow those requirements precisely
          - If specific industry filtering is requested, ONLY include assets from that industry
          - If no specific industry filtering is requested, include assets from all industries
          - If specific platforms are mentioned to include, prioritize those platforms
          - If specific buy types, asset categories, or other criteria are mentioned, filter accordingly
          
          GEOGRAPHIC TARGETING RULES (CRITICAL):
          - First, analyze the query to identify any specific states, cities, or countries mentioned
          - STRONG PRIORITY #1: If specific locations are mentioned in the query (e.g., "Karnataka", "Mumbai", "India"), ONLY select assets where targeting_options explicitly includes these exact locations
          - STRONG PRIORITY #2: If no exact match is possible but specific locations are mentioned, select assets that at least support the TYPE of location mentioned (state/city/country targeting capability)
          - PRIORITY #3: If no specific locations are mentioned, prioritize assets that have ANY geographic targeting capabilities
          - Do NOT include assets without relevant geographic targeting if the query suggests location is important
          
          BUDGET ALLOCATION RULES:
          - If query mentions specific budget allocation (e.g., "split equally", "70% to Facebook"), follow this precisely
          - Otherwise, allocate budget based on:
             1. Relevance to query intent (most relevant assets get higher %)
             2. Performance metrics (higher estimated clicks/impressions ratio gets higher %)
             3. Targeting capabilities (better targeting alignment gets higher %)
             4. Platform diversity (ensure good platform mix if multiple platforms requested)
          - Explain your budget allocation reasoning clearly in section 5
          
          - Match demographic targeting mentioned in query (age groups, gender) with suitable assets
          - Match interest or behavioral targeting in query with relevant assets
          - If you don't have enough assets or platforms, use what you have and explain the limitation
          - Use the asset's base cost (from "Base cost" field) to proportionally calculate the appropriate Budget Amount
          - Ensure Budget % totals 100%
          - Provide EXACT calculated amounts for Budget Amount column
          - Include the buy type for each asset (from buy_types field)
          - Adjust impressions/clicks proportionally to budget allocation
          - Never include placeholder or "not specified" assets in your plan
          
          7. Brief next steps (1-2 points)
        `;
        break;
    }

    // Initialize the Azure OpenAI chat model using LangChain
    const chatModel = new AzureChatOpenAI({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIEndpoint: azureEndpoint,
      temperature: 0.5,
      maxTokens: 1500 // Increased token limit to accommodate more detailed explanations
    });

    // Create the chat prompt
    const systemTemplate = `You are a helpful marketing asset assistant. Your job is to help users find the perfect marketing assets for their needs and create actionable marketing plans. Be concise and focused in your recommendations.

    When a user provides a query:
    1. Look for specific requirements including:
      - Budget information
      - Asset counts ("X assets")
      - Platform counts ("Y platforms")
      - Asset-platform combinations ("X assets from Y platforms")
      - Industry filters ("only tech industry", "only finance industry")
      - Platform inclusions ("include Facebook and Instagram")
      - Buy type preferences ("only CPC")
      - Asset category filters ("only video assets")
      - Targeting options ("only assets with youth targeting")
      - Placement specifications ("only top banner placements")
      - Budget allocation instructions ("split equally", "70% to Facebook")
      - Geographic targeting in the query (EXTRACT ALL states, cities, countries like "Karnataka", "Mumbai", "India")
      - Demographic targeting in the query ("18-24 year olds", "women", "young professionals")
      - Interest-based targeting in the query ("travelers", "food lovers", "tech enthusiasts")
      - Behavioral targeting in the query ("frequent shoppers", "new customers")
    2. Pay attention to all available asset properties (targeting_options, audience_data, placement, tags, etc.)
    3. ALWAYS present the marketing plan as a properly formatted markdown table with headings, alignment, and proper cell formatting.
    4. FOLLOW THIS STRICT LOCATION TARGETING HIERARCHY:
      A. If specific locations (states/cities/countries) are mentioned in the query, ONLY use assets that exactly match these locations in their targeting_options
      B. If exact matches aren't available but locations are mentioned, use assets that at least support the TYPE of location targeting needed (state/city/country capability)
      C. If no specific locations mentioned, prioritize assets with any geographic targeting capabilities
      D. Never include assets without geographic targeting if the query suggests location is important
    5. Implicitly extract targeting requirements from phrases like "traveling people from Mumbai" (location targeting) or "students aged 18-24" (demographic targeting).
    6. For each platform in your plan, explain why it's strategically valuable and detail its specific assets:
       - Format as "Platform Name - X% of total budget (₹exact amount)"
       - Include 3-4 specific bulleted points about the platform's strategic value:
         • Audience Behavior: How the target audience uses this platform in their daily lives
         • Engagement Format: The platform's unique storytelling or engagement capabilities
         • Targeting Advantages: Specific targeting options that align with query requirements
         • Brief emotional/strategic summary in one line
       - Then list specific assets within that platform:
         • "Asset Name - X% of platform budget (₹exact amount)": Brief explanation of this specific asset
       - Include expected performance outcomes with calculation demonstration
    
    7. Provide a clear explanation of your overall budget allocation strategy across platforms.
    
    8. Calculate impressions and clicks based on allocated budget amount:
       - Formula: (base_metric / asset.amount) × allocated_budget_amount = adjusted_metric
       - Show at least one complete calculation example with actual numbers
       - Ensure all table values reflect these exact calculations

    Important:
    - If the user requests more assets or platforms than you found, clearly state this limitation
    - If they request specific industry filtering (e.g., "only tech industry"), ONLY include assets from that industry
    - If no specific industry is mentioned in the query, include assets from all available industries
    - Always provide exact budget amounts in the marketing plan, not just percentages
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