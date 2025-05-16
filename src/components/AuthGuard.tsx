
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      if (requireAdmin && !isAdmin) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      // If user is admin, they're always authorized
      if (isAdmin) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      // Check if user's email is in authorized_users table
      try {
        const email = user.email ? user.email.toLowerCase().trim() : "";
        console.log("Checking authorization for email:", email);
        
        if (!email) {
          console.error("No email found for user");
          setIsAuthorized(false);
          setCheckingAuth(false);
          return;
        }
        
        // Query authorized_users table
        const { data, error } = await supabase
          .from('authorized_users')
          .select('*')
          .eq('email', email);

        if (error) {
          console.error("Error in authorization check query:", error);
          throw error;
        }
        
        console.log("Authorization check result:", data);
        
        // User is authorized if their email is found in the table
        const isEmailAuthorized = data && data.length > 0;
        console.log("Is email authorized:", isEmailAuthorized);
        setIsAuthorized(isEmailAuthorized);
        
        if (!isEmailAuthorized) {
          toast({
            title: "Access Denied",
            description: "Your email is not authorized to use this application.",
            variant: "destructive"
          });
          // Sign out unauthorized user
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      }
      
      setCheckingAuth(false);
    };

    if (!loading) {
      checkAuthorization();
    }
  }, [user, loading, isAdmin, requireAdmin]);

  if (loading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neugray-100 dark:bg-gray-900">
        <div className="animate-pulse text-xl font-medium">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated or not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
