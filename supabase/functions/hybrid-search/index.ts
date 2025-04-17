
// Follow Supabase Edge Function pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the admin key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize OpenAI
    const openAiConfiguration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(openAiConfiguration);

    // Parse request body
    const requestData = await req.json();
    const query = requestData.query;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Processing hybrid search with query: ${query}`);

    // Generate embedding for the query using OpenAI
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: query.trim(),
    });

    const embedding = embeddingResponse.data.data[0].embedding;
    console.log(`Generated embedding for query: ${query}`);

    // Call the match_assets_hybrid function with the embedding and original query
    const { data: searchResults, error } = await supabaseClient.rpc(
      'match_assets_hybrid',
      {
        query_embedding: embedding,
        query_text: query,
        match_threshold: 0.5, // Minimum similarity threshold
        match_count: 20,      // Maximum number of matches to return
      }
    );

    if (error) {
      console.error("Error from match_assets_hybrid:", error);
      throw error;
    }

    console.log(`Hybrid search returned ${searchResults.length} results`);
    
    return new Response(
      JSON.stringify(searchResults),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in hybrid search edge function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
