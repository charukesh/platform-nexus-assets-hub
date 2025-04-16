import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AzureOpenAIEmbeddings } from "npm:@langchain/azure-openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
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
    const matchCount = requestData.matchCount || 15; // Default to top 15 assets
    const matchThreshold = requestData.matchThreshold || 0.7; // Default similarity threshold
    
    // Check for budget in the query text
    let budget = requestData.budget;
    const budgetRegex = /budget[:\s]+(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|l|cr|lakhs?|crores?|thousand|million|lakh|crore)?/i;
    const budgetMatch = queryText.match(budgetRegex);
    
    if (!budget && budgetMatch) {
      const budgetValue = budgetMatch[1].replace(/,/g, '');
      const budgetUnit = budgetMatch[0].toLowerCase();
      
      // Convert to standard form based on units
      if (budgetUnit.includes('k') || budgetUnit.includes('thousand')) {
        budget = parseFloat(budgetValue) * 1000;
      } else if (budgetUnit.includes('l') || budgetUnit.includes('lakh')) {
        budget = parseFloat(budgetValue) * 100000;
      } else if (budgetUnit.includes('cr') || budgetUnit.includes('crore')) {
        budget = parseFloat(budgetValue) * 10000000;
      } else {
        budget = parseFloat(budgetValue);
      }
      
      console.log(`Extracted budget from query: ${budget}`);
    }
    
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required (use either "query" or "text" parameter)');
    }
    
    console.log('Processing query:', queryText);
    console.log('Mode:', mode);
    console.log('Budget:', budget !== undefined ? budget : 'Not specified');
    
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
    const [queryEmbedding] = await embeddings.embedDocuments([queryText]);
    console.log('Query embeddings generated successfully');
    
    // Query database for similar assets using vector search
    console.log('Performing vector similarity search...');
    const { data: similarAssets, error: vectorSearchError } = await supabaseClient.rpc(
      'match_assets_by_embedding_only',
      { 
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      }
    );
    
    if (vectorSearchError) {
      console.error('Error in vector similarity search:', vectorSearchError);
      throw vectorSearchError;
    }
    
    console.log(`Found ${similarAssets?.length || 0} assets via vector similarity`);
    
    // If no assets found through vector search, handle the no-results case
    let assets = similarAssets;
    if (!assets || assets.length === 0) {
      console.log('No similar assets found, returning suggestion for better query');
      
      // Create a prompt asking for better query suggestions
      const noResultsPrompt = `
        I was searching for marketing assets related to this query: "${queryText}"
        
        Unfortunately, no assets matched this query closely enough. As an expert marketing assistant,
        please suggest 3-5 alternative queries that might yield better results. Consider different ways 
        to phrase the same intent, or suggest related marketing goals that would be more likely to match 
        available assets.
        
        Also, provide a brief explanation of why the original query might not have matched any assets
        and what types of marketing assets the user might be looking for based on their intent.
      `;
      
      // Call Azure OpenAI for query suggestions
      const suggestionsResponse = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful marketing assistant that specializes in helping users find marketing assets.'
            },
            {
              role: 'user',
              content: noResultsPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!suggestionsResponse.ok) {
        throw new Error(`Azure OpenAI API error: ${suggestionsResponse.status} ${suggestionsResponse.statusText}`);
      }
      
      const suggestionsResult = await suggestionsResponse.json();
      
      // Return the suggestions
      return new Response(JSON.stringify({
        id: suggestionsResult.id,
        object: "chat.completion",
        created: suggestionsResult.created,
        model: `${azureInstance}/${azureDeployment}`,
        choices: suggestionsResult.choices,
        usage: suggestionsResult.usage,
        metadata: {
          method: 'query-suggestions',
          query: queryText,
          suggestion_type: 'no_results'
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Prepare simplified asset data with comprehensive information
    const simplifiedAssets = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      description: asset.description,
      type: asset.type,
      tags: asset.tags,
      buy_types: asset.buy_types,
      amount: asset.amount,
      estimated_clicks: asset.estimated_clicks,
      estimated_impressions: asset.estimated_impressions,
      
      // Platform information
      platform_id: asset.platform_id,
      platform_name: asset.platform_name,
      platform_industry: asset.platform_industry,
      platform_audience_data: asset.platform_audience_data,
      platform_campaign_data: asset.platform_campaign_data,
      platform_device_split: asset.platform_device_split,
      platform_mau: asset.platform_mau,
      platform_dau: asset.platform_dau,
      platform_premium_users: asset.platform_premium_users,
      platform_restrictions: asset.platform_restrictions,
      
      // Search relevance
      similarity: asset.similarity
    }));
    
    // Extract budget from request if available
    const budget = requestData.budget;
    
    // Enhanced prompt with planning table and budget handling
    const prompt = `
      I have a collection of marketing assets and platforms. Given the following search query: "${queryText}",
      please identify the most relevant assets for this query from the list below and respond in a conversational manner.
      
      Consider the asset name, category, description, type, tags, buy types, estimated clicks, and estimated impressions.
      Pay special attention to platform metrics like Monthly Active Users (MAU), Daily Active Users (DAU), 
      premium users, audience data, campaign data, device split, and restrictions when determining suitability.
      
      These assets have already been pre-filtered by similarity, with scores provided.
      
      Available assets: ${JSON.stringify(simplifiedAssets)}
      
      Respond like an AI chat assistant would:
      1. Start with a natural, conversational response addressing the user's query directly
      2. Provide only the truly relevant assets based on their query (up to 10 maximum)
      3. If no assets are directly relevant to the query, be honest about that fact
      4. For each relevant asset, explain why it's applicable and how it might help
      
      IMPORTANT: After explaining the relevant assets, create a marketing plan table in a CSV-like format:
      
      MARKETING PLAN:
      Asset,Platform,Description,Estimated Impressions,Estimated Clicks,Budget Allocation,Estimated Cost
      [asset name],[platform name],[brief description],[estimated impressions],[estimated clicks],[% of budget],[calculated cost]
      
      Here's how to create this table:
      - Include only the 3-5 most impactful assets from your recommendations
      - Use the asset's amount field as the base cost
      - ${budget !== undefined ? 
          `Work with the specified budget of ${budget} and allocate percentages accordingly` : 
          `Since no budget was specified, create a sample plan with a budget range of 5-8 lakhs (500,000 to 800,000). Adjust the allocations accordingly and mention that this is a suggested budget range.`}
      - Calculate the estimated cost based on the budget allocation percentage
      - Make sure the percentages add up to 100%
      
      End with a helpful conclusion or follow-up question.
      
      DO NOT include any separate JSON object in your response. The entire response should be 
      natural language that a user would read.
    `;
    
    console.log('Calling Azure OpenAI with prompt...');
    const response = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful marketing asset assistant. Your job is to help users find the perfect marketing assets for their needs and create actionable marketing plans. Provide detailed asset recommendations and structured budget allocations based on the query.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const openaiResponse = await response.json();
    const conversationalContent = openaiResponse.choices[0].message.content;
    
    // Extract the asset IDs mentioned in the response for metadata
    const mentionedAssetIds = assets
      .filter(asset => 
        conversationalContent.includes(asset.id) || 
        conversationalContent.includes(asset.name)
      )
      .map(asset => asset.id);
    
    // Return the combined response with metadata
    return new Response(JSON.stringify({
      id: openaiResponse.id,
      object: "chat.completion",
      created: openaiResponse.created,
      model: `${azureInstance}/${azureDeployment}`,
      choices: openaiResponse.choices,
      usage: openaiResponse.usage,
      metadata: {
        method: 'asset-search-with-plan',
        query: queryText,
        budget: budget,
        vector_results_count: similarAssets?.length || 0,
        mentioned_asset_ids: mentionedAssetIds,
        threshold_used: matchThreshold
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