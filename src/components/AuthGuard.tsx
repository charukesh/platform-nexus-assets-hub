
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
        
        const email = user.email.toLowerCase().trim();
        console.log("Checking authorization for email:", email);
        
        // Directly query authorized_users table to check if user's email exists
        const { data, error } = await supabase
          .from('authorized_users')
          .select('email')
          .eq('email', email);
        
        if (error) {
          console.error("Error checking authorization:", error);
          throw error;
        }
        
        console.log("Authorization check result:", data);
        
        // User is authorized if their email is found in the table
        const emailFound = data && data.length > 0;
        console.log("Email found in authorized_users table:", emailFound);
        
        if (!emailFound) {
          console.log("Email not found in authorized_users table");
          
          // Additional debugging: retrieve all authorized emails
          const { data: allEmails } = await supabase
            .from('authorized_users')
            .select('email');
            
          if (allEmails) {
            console.log("All authorized emails in database:", allEmails.map(item => item.email));
            console.log("Looking for:", email);
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
