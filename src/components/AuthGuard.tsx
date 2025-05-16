
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
        
        // First check if any authorized users exist
        const { count, error: countError } = await supabase
          .from('authorized_users')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error("Error checking total authorized users:", countError);
          throw countError;
        }
        
        console.log("Total authorized users:", count);
        
        // If no authorized users exist, add the current user as the first authorized user
        if (count === 0) {
          console.log("No authorized users found. Adding current user as first authorized user.");
          
          const { error: insertError } = await supabase
            .from('authorized_users')
            .insert({ email: email });
            
          if (insertError) {
            console.error("Error adding first authorized user:", insertError);
            throw insertError;
          }
          
          console.log("First user added to authorized_users table");
          setIsAuthorized(true);
          setCheckingAuth(false);
          return;
        }
        
        // Case-insensitive search for the user's email in the authorized_users table
        const { data, error } = await supabase
          .from('authorized_users')
          .select('email')
          .ilike('email', email);
        
        if (error) {
          console.error("Error checking authorization:", error);
          throw error;
        }
        
        console.log("Authorization query result:", data);
        
        // Debug info
        const { data: allEmails } = await supabase
          .from('authorized_users')
          .select('email');
          
        console.log("All authorized emails:", allEmails);
        
        // User is authorized if their email is found in the table
        const emailFound = Array.isArray(data) && data.length > 0;
        console.log("Email found in authorized_users table:", emailFound);
        
        if (!emailFound) {
          console.log("Email not found in authorized_users table");
          
          toast({
            title: "Access Denied",
            description: "Your email is not authorized to use this application.",
            variant: "destructive"
          });
          
          // Sign out unauthorized user
          await supabase.auth.signOut();
        } else {
          console.log("User is authorized!");
          setIsAuthorized(true);
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
