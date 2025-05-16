
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  role: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, appUrl }: WelcomeEmailRequest = await req.json();
    
    if (!email || !role) {
      throw new Error("Email and role are required");
    }

    // Format the role name for display (convert media_manager to Media Manager)
    const formattedRole = role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const loginUrl = appUrl ? `${appUrl}/login` : '/login';

    const emailResponse = await resend.emails.send({
      from: "Media Platform <onboarding@resend.dev>",
      to: [email],
      subject: "You've been invited to the Media Platform",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to the Media Platform!</h1>
          <p>You've been granted access to the platform with the role: <strong>${formattedRole}</strong>.</p>
          
          <h2>Role Permissions:</h2>
          ${role === 'admin' ? 
            '<p>As an <strong>Admin</strong>, you have full access to all features including user management.</p>' : 
            role === 'media_manager' ? 
            '<p>As a <strong>Media Manager</strong>, you can view and edit platforms and assets.</p>' :
            '<p>As a <strong>Media Planner</strong>, you can view platforms and assets, and create media plans.</p>'
          }
          
          <p>To get started, click the button below to log in:</p>
          
          <div style="margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Log In Now
            </a>
          </div>
          
          <p>If you have any questions, please contact the administrator.</p>
          
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
