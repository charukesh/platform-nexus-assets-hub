
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  authorizedEmails: string[];
  addAuthorizedEmail: (email: string) => Promise<void>;
  removeAuthorizedEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  
  const ADMIN_EMAIL = "charu@thealteroffice.com";

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if current user is admin
        if (session?.user?.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if current user is admin
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        // Load authorized emails if admin
        loadAuthorizedEmails();
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Use the current origin as the redirect URL
    const redirectTo = `${window.location.origin}`;
    console.log("Signing in with Google, redirect to:", redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
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
        .eq('email', normalizedEmail);
      
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
        .eq('email', normalizedEmail);
      
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
      authorizedEmails,
      addAuthorizedEmail,
      removeAuthorizedEmail
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
