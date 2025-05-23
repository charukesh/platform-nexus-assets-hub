import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export type UserRole = 'admin' | 'media_manager' | 'media_planner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userRole: UserRole;
  authorizedEmails: string[];
  addAuthorizedEmail: (email: string, role: UserRole) => Promise<void>;
  removeAuthorizedEmail: (email: string) => Promise<boolean>; 
  updateUserRole: (email: string, role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('media_planner');
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

  const loadUserRole = async (email: string) => {
    try {
      console.log("Loading role for user:", email);
      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setUserRole('admin');
        return;
      }

      const { data, error } = await supabase
        .from('authorized_users')
        .select('role')
        .ilike('email', email.toLowerCase().trim())
        .single();
      
      if (error) {
        console.error('Error loading user role:', error);
        return;
      }

      // Now we have a 'role' column, so this will work
      const role = (data?.role as UserRole) || 'media_planner'; 
      console.log("Loaded role for user:", role);
      
      setUserRole(role);
      setIsAdmin(role === 'admin');
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if current user is admin or load role
        if (session?.user?.email) {
          if (session.user.email === ADMIN_EMAIL) {
            setIsAdmin(true);
            setUserRole('admin');
          } else {
            loadUserRole(session.user.email);
          }
        } else {
          setIsAdmin(false);
          setUserRole('media_planner');
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
      
      // Check if current user is admin or load role
      if (session?.user?.email) {
        if (session.user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          setUserRole('admin');
          // Load authorized emails if admin
          loadAuthorizedEmails();
        } else {
          loadUserRole(session.user.email);
        }
      } else {
        setIsAdmin(false);
        setUserRole('media_planner');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Get the current host name
    const currentHost = window.location.origin;
    console.log("Signing in with Google, redirect to:", currentHost);
    
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
        redirectTo: currentHost,
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
        .select('email, role');
      
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

  const addAuthorizedEmail = async (email: string, role: UserRole = 'media_planner') => {
    try {
      // Normalize email (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`Adding authorized email: ${normalizedEmail} with role: ${role}`);
      
      // Use the Supabase Edge Functions API directly
      const { data, error } = await supabase.functions.invoke('manage-authorized-users', {
        body: {
          action: 'add',
          email: normalizedEmail,
          role: role
        }
      });

      if (error) {
        console.error('Error from manage-authorized-users function:', error);
        if (error.message?.includes('already authorized')) {
          toast({
            title: "Email Already Authorized",
            description: `${normalizedEmail} already has access.`
          });
          return;
        }
        
        toast({
          title: "Error",
          description: error.message || "Failed to add user. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      console.log(`Email successfully added to database: ${normalizedEmail} with role: ${role}`);
      
      // Reload the list
      await loadAuthorizedEmails();
      
      // Send welcome email
      try {
        const appUrl = window.location.origin;
        const { error: welcomeError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: normalizedEmail,
            role: role,
            appUrl: appUrl
          }
        });

        if (welcomeError) {
          console.error('Error sending welcome email:', welcomeError);
          // We don't throw here since adding the user succeeded
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // We don't throw here since adding the user succeeded
      }
      
      toast({
        title: "Email Added",
        description: `${normalizedEmail} has been granted access with role: ${role}.`
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

  const updateUserRole = async (email: string, role: UserRole) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`Updating role for ${normalizedEmail} to ${role}`);
      
      // Use the Supabase Edge Functions API directly
      const { data, error } = await supabase.functions.invoke('manage-authorized-users', {
        body: {
          action: 'update',
          email: normalizedEmail,
          role: role
        }
      });

      if (error) {
        console.error('Error from manage-authorized-users function:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update role. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      console.log("Update result:", data);
      
      // Reload the list
      await loadAuthorizedEmails();
      
      toast({
        title: "Role Updated",
        description: `${email} role has been updated to ${role}.`
      });

      // If current user's role was updated, refresh their role
      if (user?.email?.toLowerCase().trim() === normalizedEmail) {
        loadUserRole(normalizedEmail);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeAuthorizedEmail = async (email: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Removing authorized email:", normalizedEmail);
      
      // Use the Supabase Edge Functions API directly
      const { data, error } = await supabase.functions.invoke('manage-authorized-users', {
        body: {
          action: 'remove',
          email: normalizedEmail
        }
      });

      if (error) {
        console.error('Error from manage-authorized-users function:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to remove user. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Remove result:", data);
      
      if (!data?.success) {
        toast({
          title: "Error",
          description: data?.message || "Failed to remove user. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Email successfully removed from database:", normalizedEmail);
      
      toast({
        title: "Email Removed",
        description: `${email} access has been revoked.`
      });
      
      // Reload the list to reflect the change
      await loadAuthorizedEmails();
      
      return true;
    } catch (error) {
      console.error('Error removing authorized email:', error);
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signInWithGoogle,
      signOut,
      isAdmin,
      userRole,
      authorizedEmails,
      addAuthorizedEmail,
      removeAuthorizedEmail,
      updateUserRole
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
