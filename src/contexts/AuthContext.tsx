
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
  removeAuthorizedEmail: (email: string) => Promise<void>;
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
      
      // Insert the new email with role - now we can include role in the insert
      const { error: insertError } = await supabase
        .from('authorized_users')
        .insert({ email: normalizedEmail, role: role });
      
      if (insertError) {
        console.error('Error adding authorized email:', insertError);
        throw insertError;
      }
      
      console.log(`Email successfully added to database: ${normalizedEmail} with role: ${role}`);
      
      // Reload the list
      await loadAuthorizedEmails();
      
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
      
      const { error } = await supabase
        .from('authorized_users')
        .update({ role })
        .ilike('email', normalizedEmail);
      
      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
      
      console.log(`Role successfully updated for ${normalizedEmail} to ${role}`);
      
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
