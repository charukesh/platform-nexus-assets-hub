
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

      // Check if user's email is in authorized_users table
      try {
        if (!user.email) {
          console.error("No email found for user");
          setIsAuthorized(false);
          setCheckingAuth(false);
          return;
        }
        
        const email = user.email.toLowerCase().trim();
        console.log("Checking authorization for email:", email);
        
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
        
        if (!isEmailAuthorized) {
          console.log("Email not found in authorized_users table");
          
          // Double check by running a raw query to see all emails
          const { data: allEmails, error: allEmailsError } = await supabase
            .from('authorized_users')
            .select('email');
            
          if (allEmailsError) {
            console.error("Error fetching all emails:", allEmailsError);
          } else {
            console.log("All authorized emails in database:", allEmails);
            console.log("Looking for:", email);
            
            // Manual check for the email
            const matchFound = allEmails.some(item => 
              item.email.toLowerCase().trim() === email
            );
            console.log("Manual check result:", matchFound);
          }
          
          toast({
            title: "Access Denied",
            description: "Your email is not authorized to use this application.",
            variant: "destructive"
          });
          
          // Sign out unauthorized user
          await supabase.auth.signOut();
        }
        
        setIsAuthorized(isEmailAuthorized);
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
