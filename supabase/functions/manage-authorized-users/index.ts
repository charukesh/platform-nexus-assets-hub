
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract the auth token from the request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No authorization token provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token", details: authError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    // Check if user is admin (either hard-coded admin email or has admin role)
    const isAdmin = user.email === "charu@thealteroffice.com";
    
    if (!isAdmin) {
      // Check for admin role in authorized_users table
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('authorized_users')
        .select('role')
        .eq('email', user.email)
        .single();
        
      if (roleError || roleData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Admin privileges required" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          }
        );
      }
    }
    
    // Parse the request body for the operation
    const { action, email, role } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Perform the requested action
    let result;
    
    switch (action) {
      case 'add':
        if (!role) {
          return new Response(
            JSON.stringify({ error: "Role is required for adding users" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Check if email already exists
        const { data: existingData, error: checkError } = await supabaseAdmin
          .from('authorized_users')
          .select('email')
          .eq('email', normalizedEmail);
          
        if (checkError) {
          throw checkError;
        }
        
        if (existingData && existingData.length > 0) {
          return new Response(
            JSON.stringify({ error: "Email already authorized", email: normalizedEmail }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409,
            }
          );
        }
        
        // Add the user
        result = await supabaseAdmin
          .from('authorized_users')
          .insert({ email: normalizedEmail, role });
        break;
        
      case 'update':
        if (!role) {
          return new Response(
            JSON.stringify({ error: "Role is required for updating users" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        result = await supabaseAdmin
          .from('authorized_users')
          .update({ role })
          .eq('email', normalizedEmail);
        break;
        
      case 'remove':
        result = await supabaseAdmin
          .from('authorized_users')
          .delete()
          .eq('email', normalizedEmail);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Must be 'add', 'update', or 'remove'" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${normalizedEmail} ${action === 'add' ? 'added' : action === 'update' ? 'updated' : 'removed'} successfully`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in manage-authorized-users function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message || "An unexpected error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
