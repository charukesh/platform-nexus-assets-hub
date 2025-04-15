
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Validate configuration
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required configuration');
    }

    // Parse request data
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('A valid query is required');
    }

    console.log('Processing query:', query);

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Execute the text similarity search
    console.log('Performing text search in database...');
    const { data, error } = await supabaseClient.rpc('match_assets', {
      query_text: query,
      match_threshold: 0.5,
      match_count: 10
    });

    if (error) {
      console.error('Error in text search:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} matching assets`);

    return new Response(JSON.stringify({ results: data }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in create-embedding-search function:', error);
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
