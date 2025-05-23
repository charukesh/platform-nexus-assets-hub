
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
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
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
      console.error("Auth error:", authError);
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
        console.error("Role verification error:", roleError);
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
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("JSON parsing error:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { action, email, role } = requestData;
    
    console.log("Received request:", { action, email, role });
    
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
    let result: any = { success: false };
    
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
          console.error("Error checking existing user:", checkError);
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
        console.log(`Adding user with email: ${normalizedEmail} and role: ${role}`);
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('authorized_users')
          .insert({ email: normalizedEmail, role })
          .select();
          
        if (insertError) {
          console.error("Error adding user:", insertError);
          throw insertError;
        }
        
        result = { success: true, data: insertData };
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
        
        console.log(`Updating user with email: ${normalizedEmail} to role: ${role}`);
        
        // First check if the user exists
        const { data: userToUpdate, error: userCheckError } = await supabaseAdmin
          .from('authorized_users')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();
        
        if (userCheckError) {
          console.error("Error checking if user exists for update:", userCheckError);
          throw userCheckError;
        }
        
        if (!userToUpdate) {
          return new Response(
            JSON.stringify({ 
              error: "User not found", 
              message: "Cannot update a user that doesn't exist"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }
        
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('authorized_users')
          .update({ role })
          .eq('email', normalizedEmail)
          .select();
          
        if (updateError) {
          console.error("Error updating user role:", updateError);
          throw updateError;
        }
        
        result = { success: true, data: updateData };
        break;
        
      case 'remove':
        console.log(`Removing user with email: ${normalizedEmail}`);
        
        // Explicitly use maybeSingle() to avoid errors when the row doesn't exist
        const { data: existingUser, error: existingError } = await supabaseAdmin
          .from('authorized_users')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();
          
        if (existingError) {
          console.error("Error checking if user exists:", existingError);
          throw existingError;
        }
        
        if (!existingUser) {
          return new Response(
            JSON.stringify({ 
              error: "User not found", 
              message: "Cannot delete a user that doesn't exist"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }
        
        const { error: deleteError } = await supabaseAdmin
          .from('authorized_users')
          .delete()
          .eq('email', normalizedEmail);
          
        if (deleteError) {
          console.error("Error deleting user:", deleteError);
          throw deleteError;
        }
        
        // Verify deletion was successful
        const { data: checkAfterDelete, error: checkDeleteError } = await supabaseAdmin
          .from('authorized_users')
          .select('email')
          .eq('email', normalizedEmail)
          .maybeSingle();
          
        if (checkDeleteError) {
          console.error("Error verifying deletion:", checkDeleteError);
        }
        
        if (checkAfterDelete) {
          return new Response(
            JSON.stringify({ 
              error: "Failed to delete user", 
              message: "User still exists in the database after delete operation"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        result = { success: true };
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${normalizedEmail} ${action === 'add' ? 'added' : action === 'update' ? 'updated' : 'removed'} successfully`,
        data: result.data
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
