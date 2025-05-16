import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

type UserRole = 'admin' | 'organizer' | 'media_planner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userRoles: UserRole[];
  authorizedEmails: string[];
  addAuthorizedEmail: (email: string) => Promise<void>;
  removeAuthorizedEmail: (email: string) => Promise<void>;
  addUserRole: (userId: string, email: string, role: UserRole) => Promise<void>;
  removeUserRole: (userId: string, role: UserRole) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  
  const ADMIN_EMAIL = "charu@thealteroffice.com";

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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user logged in, fetch their roles
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
          setIsAdmin(false);
        }
        
        // If just signed out, clean up state
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is logged in
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      // Fetch roles from user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }
      
      if (data) {
        const roles = data.map(item => item.role as UserRole);
        console.log("User roles:", roles);
        setUserRoles(roles);
        
        // Check if user has admin role
        const hasAdminRole = roles.includes('admin');
        setIsAdmin(hasAdminRole);
        
        // If user is admin, load authorized emails
        if (hasAdminRole) {
          loadAuthorizedEmails();
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    // Use the provided redirectTo or current origin as the redirect URL
    const finalRedirectTo = redirectTo || `${window.location.origin}`;
    console.log("Signing in with Google, redirect to:", finalRedirectTo);
    
    // Clean up existing auth state first
    cleanupAuthState();
    
    // Try to sign out first to clear any existing sessions
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log("Error during pre-login signout:", e);
      // Continue even if this fails
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: finalRedirectTo,
        queryParams: {
          prompt: 'select_account' // Force account selection
        }
      }
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error during signout:', error);
      // Force clean state even if API call fails
      cleanupAuthState();
    }
  };

  const loadAuthorizedEmails = async () => {
    try {
      console.log("Loading authorized emails...");
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email');
      
      if (error) {
        console.error('Error loading authorized emails:', error);
        throw error;
      }
      
      if (data) {
        const emails = data.map(item => item.email.toLowerCase().trim());
        console.log("Authorized emails loaded:", emails);
        setAuthorizedEmails(emails);
      }
    } catch (error) {
      console.error('Error loading authorized emails:', error);
      toast({
        title: "Error",
        description: "Could not load authorized emails.",
        variant: "destructive"
      });
    }
  };

  const addAuthorizedEmail = async (email: string) => {
    try {
      // Normalize email (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Adding authorized email:", normalizedEmail);
      
      // Check if email already exists
      const { data: existingData, error: checkError } = await supabase
        .from('authorized_users')
        .select('email')
        .ilike('email', normalizedEmail);
      
      if (checkError) {
        console.error('Error checking if email exists:', checkError);
        throw checkError;
      }
        
      if (existingData && existingData.length > 0) {
        console.log("Email already exists:", normalizedEmail);
        toast({
          title: "Email Already Authorized",
          description: `${normalizedEmail} already has access.`
        });
        return;
      }
      
      // Insert the new email
      const { error: insertError } = await supabase
        .from('authorized_users')
        .insert({ email: normalizedEmail });
      
      if (insertError) {
        console.error('Error adding authorized email:', insertError);
        throw insertError;
      }
      
      console.log("Email successfully added to database:", normalizedEmail);
      
      // Reload the list
      await loadAuthorizedEmails();
      
      toast({
        title: "Email Added",
        description: `${normalizedEmail} has been granted access.`
      });
    } catch (error) {
      console.error('Error adding authorized email:', error);
      toast({
        title: "Error",
        description: "Failed to add email. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeAuthorizedEmail = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Removing authorized email:", normalizedEmail);
      
      const { error } = await supabase
        .from('authorized_users')
        .delete()
        .ilike('email', normalizedEmail);
      
      if (error) {
        console.error('Error removing authorized email:', error);
        throw error;
      }
      
      console.log("Email successfully removed from database:", normalizedEmail);
      
      // Reload the list
      await loadAuthorizedEmails();
      
      toast({
        title: "Email Removed",
        description: `${email} access has been revoked.`
      });
    } catch (error) {
      console.error('Error removing authorized email:', error);
      throw error;
    }
  };

  const addUserRole = async (userId: string, email: string, role: UserRole) => {
    try {
      console.log(`Adding role ${role} to user ${userId} (${email})`);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, email, role });
      
      if (error) {
        console.error('Error adding user role:', error);
        
        // Check for unique constraint violation
        if (error.code === '23505') {
          toast({
            title: "Role Already Assigned",
            description: `${email} already has the ${role} role.`,
          });
          return;
        }
        
        throw error;
      }
      
      toast({
        title: "Role Added",
        description: `${role} role has been assigned to ${email}.`,
      });
      
      // Refresh roles if adding role to current user
      if (user && user.id === userId) {
        fetchUserRoles(userId);
      }
    } catch (error) {
      console.error('Error adding user role:', error);
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeUserRole = async (userId: string, role: UserRole) => {
    try {
      console.log(`Removing role ${role} from user ${userId}`);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) {
        console.error('Error removing user role:', error);
        throw error;
      }
      
      toast({
        title: "Role Removed",
        description: `${role} role has been removed.`,
      });
      
      // Refresh roles if removing role from current user
      if (user && user.id === userId) {
        fetchUserRoles(userId);
      }
    } catch (error) {
      console.error('Error removing user role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signInWithGoogle,
      signOut,
      isAdmin,
      userRoles,
      authorizedEmails,
      addAuthorizedEmail,
      removeAuthorizedEmail,
      addUserRole,
      removeUserRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
