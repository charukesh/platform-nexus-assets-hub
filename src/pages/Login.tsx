
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginInProgress, setLoginInProgress] = useState(false);

  useEffect(() => {
    // Check for auth tokens in URL after OAuth redirect
    const handleRedirectResult = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log("OAuth redirect detected, processing login...");
        
        // Clear the hash without causing a navigation
        window.history.replaceState(null, document.title, window.location.pathname);
        
        toast({
          title: "Successfully signed in",
          description: "Checking authorization status...",
        });
      }
    };

    handleRedirectResult();

    // Redirect if user is already logged in
    if (user && !loading) {
      console.log("User already logged in, redirecting to home");
      navigate('/');
    }
  }, [user, loading, navigate, location]);

  const handleGoogleLogin = async () => {
    try {
      setLoginInProgress(true);
      console.log("Starting Google login process");
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "There was an error signing in with Google.",
        variant: "destructive"
      });
      setLoginInProgress(false);
    }
  };

  if (loading || loginInProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neugray-100 dark:bg-gray-900">
        <div className="animate-pulse text-xl font-medium">
          {loginInProgress ? "Signing in..." : "Loading..."}
        </div>
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
          
          <Button 
            className="w-full flex items-center justify-center gap-2 py-6 text-base"
            onClick={handleGoogleLogin}
            type="button"
            disabled={loginInProgress}
          >
            <Mail size={20} />
            Sign in with Google
          </Button>
        </div>
      </NeuCard>
    </div>
  );
};

export default Login;
