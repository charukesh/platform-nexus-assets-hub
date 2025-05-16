
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
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
      // Fix: Use a generic query that doesn't depend on typed tables
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email');
      
      if (error) throw error;
      
      if (data) {
        const emails = data.map(item => item.email);
        setAuthorizedEmails(emails);
      }
    } catch (error) {
      console.error('Error loading authorized emails:', error);
    }
  };

  const addAuthorizedEmail = async (email: string) => {
    try {
      // Fix: Use a generic query that doesn't depend on typed tables
      const { error } = await supabase
        .from('authorized_users')
        .insert({ email });
      
      if (error) throw error;
      
      // Reload the list
      await loadAuthorizedEmails();
    } catch (error) {
      console.error('Error adding authorized email:', error);
      throw error;
    }
  };

  const removeAuthorizedEmail = async (email: string) => {
    try {
      // Fix: Use a generic query that doesn't depend on typed tables
      const { error } = await supabase
        .from('authorized_users')
        .delete()
        .eq('email', email);
      
      if (error) throw error;
      
      // Reload the list
      await loadAuthorizedEmails();
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
