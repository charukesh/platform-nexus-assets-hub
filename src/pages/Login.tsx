
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const Login = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
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
          
          <Button 
            className="w-full flex items-center justify-center gap-2 py-6 text-base"
            onClick={handleGoogleLogin}
            type="button"
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
