
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is incomplete');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch all assets that need embeddings regenerated
    const { data: assets, error: fetchError } = await supabaseClient
      .from('assets')
      .select('id')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching assets:', fetchError);
      throw fetchError;
    }

    if (!assets || assets.length === 0) {
      console.log('No assets found to process');
      return new Response(JSON.stringify({
        success: true,
        message: 'No assets found to process',
        processed: 0
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Found ${assets.length} assets to process`);

    let processedCount = 0;
    let failedCount = 0;
    const failures = [];

    // Process each asset by calling the generate-embeddings function
    for (const asset of assets) {
      try {
        console.log(`Processing asset: ${asset.id}`);
        
        const { data, error } = await supabaseClient
          .functions
          .invoke('generate-embeddings', {
            body: { id: asset.id }
          });

        if (error) {
          console.error(`Error processing asset ${asset.id}:`, error);
          failedCount++;
          failures.push({ id: asset.id, error: error.message });
        } else {
          console.log(`Successfully processed asset: ${asset.id}`);
          processedCount++;
        }
      } catch (err) {
        console.error(`Exception processing asset ${asset.id}:`, err);
        failedCount++;
        failures.push({ id: asset.id, error: err.message || 'Unknown error' });
      }
    }

    console.log(`Completed processing ${processedCount} assets`);
    console.log(`Failed to process ${failedCount} assets`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${processedCount} assets (${failedCount} failed)`,
      processed: processedCount,
      failed: failedCount,
      failures: failures.length > 0 ? failures : undefined
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in regenerate-embeddings function:', error);
    console.error('Error details:', error.stack || 'No stack trace available');
    
    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
