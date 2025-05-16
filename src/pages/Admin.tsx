
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, X, RefreshCw } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, loading, isAdmin, authorizedEmails, addAuthorizedEmail, removeAuthorizedEmail } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Directly fetch emails from database for verification
  const [dbEmails, setDbEmails] = useState<string[]>([]);

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
    }

    // Fetch emails directly from the database
    fetchEmailsFromDb();
  }, [user, loading, isAdmin, navigate]);

  const fetchEmailsFromDb = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email');
      
      if (error) {
        console.error('Error fetching emails from DB:', error);
        toast({
          title: "Error",
          description: "Failed to fetch authorized emails from database.",
          variant: "destructive"
        });
      } else {
        const emails = data.map(item => item.email.toLowerCase().trim());
        console.log("Emails from database:", emails);
        setDbEmails(emails);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const validateEmail = (email: string) => {
    return email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAddEmail = async () => {
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) {
      toast({
        title: "Invalid Email",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addAuthorizedEmail(trimmedEmail);
      setNewEmail("");
      
      // Refresh the list from DB after adding
      fetchEmailsFromDb();
    } catch (error) {
      console.error("Error adding email:", error);
      toast({
        title: "Error",
        description: "Failed to add email to allowed list.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      await removeAuthorizedEmail(email);
      
      // Refresh the list from DB after removing
      fetchEmailsFromDb();
    } catch (error) {
      console.error("Error removing email:", error);
      toast({
        title: "Error",
        description: "Failed to remove email from allowed list.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neugray-100 dark:bg-gray-900">
        <div className="animate-pulse text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          
          <NeuCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Access Management</h2>
            <p className="text-muted-foreground mb-6">
              Control which email addresses can access the application. Only users with emails
              listed below will be able to log in and use the platform.
            </p>
            
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddEmail}>Add Email</Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Authorized Emails</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEmailsFromDb}
                  disabled={refreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </Button>
              </div>
              
              {authorizedEmails.length === 0 && dbEmails.length === 0 ? (
                <p className="text-muted-foreground italic">No authorized emails yet.</p>
              ) : (
                <>
                  <ul className="space-y-2">
                    {dbEmails.map((email) => (
                      <li key={email} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-muted-foreground" />
                          {email}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveEmail(email)}
                          aria-label={`Remove ${email}`}
                        >
                          <X size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Display warning if lists don't match */}
                  {authorizedEmails.length !== dbEmails.length && (
                    <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded-md text-sm">
                      <p>Warning: The displayed email list may be out of sync. Please refresh to see the latest data.</p>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Note:</strong> As the admin (charu@thealteroffice.com), you will always have access regardless of this list.</p>
              </div>
            </div>
          </NeuCard>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Admin;
