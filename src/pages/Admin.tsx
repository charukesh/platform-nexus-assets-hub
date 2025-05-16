
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const Admin = () => {
  const { user, loading, isAdmin, authorizedEmails, addAuthorizedEmail, removeAuthorizedEmail } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const navigate = useNavigate();

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
  }, [user, loading, isAdmin, navigate]);

  const handleAddEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addAuthorizedEmail(newEmail);
      toast({
        title: "Email Added",
        description: `${newEmail} has been granted access.`
      });
      setNewEmail("");
    } catch (error) {
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
      toast({
        title: "Email Removed",
        description: `${email} access has been revoked.`
      });
    } catch (error) {
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
              <h3 className="text-lg font-medium mb-2">Authorized Emails</h3>
              
              {authorizedEmails.length === 0 ? (
                <p className="text-muted-foreground italic">No authorized emails yet.</p>
              ) : (
                <ul className="space-y-2">
                  {authorizedEmails.map((email) => (
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
