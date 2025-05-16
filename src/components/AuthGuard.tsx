
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
    
    // Try checking if the user's Auth ID exists first
    // This connects the Auth system with your database table
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user from auth:", userError);
      throw userError;
    }
    
    if (userData && userData.user) {
      console.log("User found in Auth system:", userData.user.id);
      
      // Now check if the email exists in authorized_users table
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')  // Select all columns to see what's returned
        .eq('email', email);
      
      console.log("Authorization query result:", data);
      
      if (error) {
        console.error("Error checking authorization:", error);
        throw error;
      }
      
      // User is authorized if their email is found in the table
      const emailFound = Array.isArray(data) && data.length > 0;
      console.log("Email found in authorized_users table:", emailFound);
      
      if (!emailFound) {
        console.log("Email not found in authorized_users table");
        
        // Try a more direct query without any filters to see all authorized users
        const { data: allAuthorizedUsers } = await supabase
          .from('authorized_users')
          .select('*');
        
        console.log("All authorized users:", allAuthorizedUsers);
        
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
        setCheckingAuth(false);
        return;
      }
    }
    
    setIsAuthorized(false);
  } catch (error) {
    console.error("Error checking authorization:", error);
    setIsAuthorized(false);
    }
  
    setCheckingAuth(false);
    };
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
