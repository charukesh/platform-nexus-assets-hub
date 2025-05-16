
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
        console.log("No user found, not authorized");
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      console.log("Checking authorization for user:", user.email);

      // If user is admin, they're always authorized
      if (requireAdmin && !isAdmin) {
        console.log("Admin required but user is not admin");
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      // If user is admin, they're always authorized
      if (isAdmin) {
        console.log("User is admin, authorized");
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      // For non-admin users, check if email is in authorized_users table
      try {
        if (!user.email) {
          console.error("No email found for user");
          setIsAuthorized(false);
          setCheckingAuth(false);
          return;
        }
        
        // Make sure email is normalized (lowercase and trimmed)
        const email = user.email.toLowerCase().trim();
        console.log("Checking authorization for normalized email:", email);
        
        // Directly query authorized_users table to check if user's email exists
        const { data, error } = await supabase
          .from('authorized_users')
          .select('email')
          .eq('email', email);
        
        if (error) {
          console.error("Error checking authorization:", error);
          throw error;
        }
        
        console.log("Authorization check result data:", data);
        
        // User is authorized if their email is found in the table
        const emailFound = Array.isArray(data) && data.length > 0;
        console.log("Email found in authorized_users table:", emailFound);
        
        if (!emailFound) {
          console.log("Email not found in authorized_users table");
          
          // Get all authorized emails for debugging
          const { data: allAuthorizedEmails } = await supabase
            .from('authorized_users')
            .select('email');
            
          console.log("All authorized emails:", allAuthorizedEmails);
          
          // Compare the emails exactly to see if there's a case or whitespace issue
          if (allAuthorizedEmails && allAuthorizedEmails.length > 0) {
            const authorizedEmailList = allAuthorizedEmails.map(e => e.email.toLowerCase().trim());
            console.log("Normalized authorized emails:", authorizedEmailList);
            console.log("Looking for normalized email:", email);
            console.log("Exact match check:", authorizedEmailList.includes(email));
          }
          
          toast({
            title: "Access Denied",
            description: "Your email is not authorized to use this application.",
            variant: "destructive"
          });
          
          // Sign out unauthorized user
          await supabase.auth.signOut();
        } else {
          console.log("User is authorized!");
          toast({
            title: "Welcome",
            description: "You've been successfully authorized.",
          });
        }
        
        setIsAuthorized(emailFound);
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
