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

  const encoder = new TextEncoder();
  const respondWithStream = (stream: ReadableStream) => {
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  };

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

    // Initialize clients and process request data
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const requestData = await req.json();
    const queryText = requestData.query || requestData.text;
    const matchCount = requestData.matchCount || 3;
    const matchThreshold = requestData.matchThreshold || 0.75;

    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      throw new Error('A valid query is required');
    }

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
      queryText
    ]);
    console.log('Query embeddings generated successfully with length:', queryEmbedding.length);

    const { data: matchResults, error: matchError } = await supabaseClient.rpc('match_assets_by_embedding_only', {
      query_embedding: queryEmbedding,
      match_threshold: parseFloat(matchThreshold.toString()),
      match_count: parseInt(matchCount.toString(), 10)
    });

    if (matchError) {
      throw matchError;
    }

    const matchedAssets = matchResults || [];
    const processedAssets = matchedAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      platform: asset.platform,
      platform_name: asset.platform_name,
      platform_description: asset.platform_description,
      amount: asset.amount !== null ? Number(asset.amount) : null,
      estimated_impressions: Number(asset.estimated_impressions),
      estimated_clicks: Number(asset.estimated_clicks),
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
          Given search query: "${queryText}", analyze it to understand the user's marketing needs and budget requirements.
          
          Provide a marketing plan based on these assets that were found through semantic search:
          ${JSON.stringify(processedAssets.slice(0, 3))}
          
          Include:
          1. Brief response to query (2-3 sentences)
          2. For each asset, explain WHY it was chosen and how it meets the user's needs (1-2 sentences per asset)
          3. Marketing plan as:
          
          MARKETING PLAN:
          Asset,Platform,Platform Description,Budget %,Cost,Adj. Impressions,Adj. Clicks
          [name],[platform_name],[platform_description],[%],[cost],[proportional impressions],[proportional clicks]
          
          Rules:
          - Extract any budget information from the query text; if none is specified, use a default of 5-8 lakhs
          - Use amount as base cost
          - Ensure % totals 100%
          - Adjust impressions/clicks proportionally to budget
          - Example: If base cost=100K with 50K impressions and allocation=200K, adjusted impressions=100K
          
          4. Brief next steps (1-2 points)
        `;
        break;
    }

    const chatModel = new AzureChatOpenAI({
      azureOpenAIApiKey: azureApiKey,
      azureOpenAIApiVersion: azureApiVersion,
      azureOpenAIApiInstanceName: azureInstance,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIEndpoint: `https://${azureInstance}.openai.azure.com`,
      temperature: 0.5,
      maxTokens: 1000,
      streaming: true
    });

    const systemTemplate = "You are a helpful marketing asset assistant. Your job is to help users find the perfect marketing assets for their needs and create actionable marketing plans. Be concise and focused in your recommendations.";
    const humanTemplate = "{prompt}";

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate)
    ]);

    const formattedPrompt = await chatPrompt.formatMessages({
      prompt: promptContent
    });

    // Create a TransformStream for handling the streamed response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming response
    const runStream = await chatModel.stream(formattedPrompt);

    // Process the stream
    (async () => {
      try {
        for await (const chunk of runStream) {
          if (chunk.content) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return respondWithStream(stream.readable);

  } catch (error) {
    console.error('Error in asset search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
