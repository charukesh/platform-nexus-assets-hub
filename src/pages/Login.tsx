
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Clean up any leftover Supabase auth state
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log("Cleaning up auth key:", key);
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log("Cleaning up session key:", key);
        sessionStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Check for auth tokens in URL after OAuth redirect
    const handleRedirectResult = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log("OAuth redirect detected, processing login...");
        
        // Clear the hash without causing a navigation
        window.history.replaceState(null, document.title, window.location.pathname);
        
        setAuthMessage("Successfully signed in. Checking authorization...");
      }
    };

    handleRedirectResult();

    // If user is logged in, test if they're also authorized
    const checkIfAuthorized = async () => {
      if (user && !loading) {
        console.log("User is logged in, checking if authorized:", user.email);
        
        // Check if user is the admin
        const adminEmail = "charu@thealteroffice.com";
        if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
          console.log("Admin user detected, authorized");
          
          // Show welcome toast only once after successful login
          toast({
            title: "Welcome",
            description: "You've been successfully authorized.",
          });
          
          navigate('/');
          return;
        }
        
        // For non-admin users, check the database
        try {
          if (!user.email) {
            console.error("No email found for user");
            return;
          }
          
          const normalizedEmail = user.email.toLowerCase().trim();
          console.log("Checking authorization for:", normalizedEmail);
          
          // First check if any users exist in the authorized_users table
          const { count, error: countError } = await supabase
            .from('authorized_users')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            console.error("Error checking total authorized users:", countError);
            return;
          }
          
          console.log("Total authorized users:", count);
          
          // If no users exist, add the current user as the first authorized user
          if (count === 0) {
            console.log("No authorized users found. Adding current user as first authorized user.");
            
            const { error: insertError } = await supabase
              .from('authorized_users')
              .insert({ email: normalizedEmail });
              
            if (insertError) {
              console.error("Error adding first authorized user:", insertError);
              return;
            }
            
            console.log("First user added to authorized_users table");
            
            // Show welcome toast only once after successful login
            toast({
              title: "Welcome",
              description: "You've been successfully authorized.",
            });
            
            navigate('/');
            return;
          }
          
          // Use case-insensitive search with ILIKE
          const { data, error } = await supabase
            .from('authorized_users')
            .select('email')
            .ilike('email', normalizedEmail);
            
          if (error) {
            console.error("Error checking authorization:", error);
            return;
          }
          
          console.log("Authorization check result:", data);
          
          // Debug info
          const { data: allEmails } = await supabase
            .from('authorized_users')
            .select('email');
            
          console.log("All authorized emails:", allEmails);
          
          if (data && data.length > 0) {
            console.log("User is authorized, redirecting to home");
            
            // Show welcome toast only once after successful login
            toast({
              title: "Welcome",
              description: "You've been successfully authorized.",
            });
            
            navigate('/');
          } else {
            console.log("User is not authorized");
            setAuthMessage("Your email is not authorized. Please contact an administrator.");
          }
        } catch (e) {
          console.error("Error in authorization check:", e);
        }
      }
    };
    
    checkIfAuthorized();
  }, [user, loading, navigate, location]);

  const handleGoogleLogin = async () => {
    try {
      setLoginInProgress(true);
      setAuthMessage("Starting Google login process...");
      console.log("Starting Google login process");
      
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Try to sign out first to clear any existing sessions
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log("Error during pre-login signout:", e);
        // Continue even if this fails
      }
      
      // Use current host for redirect URL
      const redirectTo = `${window.location.origin}`;
      console.log("Using redirect URL:", redirectTo);
      
      await signInWithGoogle(redirectTo);
      // Don't reset loginInProgress here as we want to show loading until redirect happens
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "There was an error signing in with Google.",
        variant: "destructive"
      });
      setLoginInProgress(false);
      setAuthMessage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neugray-100 dark:bg-gray-900">
        <div className="animate-pulse text-xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neugray-100 dark:bg-gray-900 p-4">
      <NeuCard className="max-w-md w-full p-8">
        <div className="flex flex-col items-center space-y-6">
          <img 
            src="/lovable-uploads/d8b438e7-71aa-4140-9e46-a826b575f9a5.png" 
            alt="MobiStackIO Logo" 
            className="h-16 w-auto mb-4" 
          />
          
          <h1 className="text-2xl font-bold text-center">
            Welcome to MobiStack
          </h1>
          
          <p className="text-center text-muted-foreground mb-4">
            Please sign in to continue
          </p>
          
          {authMessage && (
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md text-center w-full">
              <p className="text-blue-700 dark:text-blue-200">{authMessage}</p>
            </div>
          )}
          
          <Button 
            className="w-full flex items-center justify-center gap-2 py-6 text-base"
            onClick={handleGoogleLogin}
            type="button"
            disabled={loginInProgress}
          >
            {loginInProgress ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Mail size={20} />
            )}
            {loginInProgress ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </NeuCard>
    </div>
  );
};

export default Login;
