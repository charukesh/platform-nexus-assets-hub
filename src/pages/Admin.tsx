
import React, { useState } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Shield } from "lucide-react";
import RoleManager from "@/components/admin/RoleManager";

const Admin: React.FC = () => {
  const { authorizedEmails, addAuthorizedEmail, removeAuthorizedEmail } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState("authorized-users");

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) return;
    
    try {
      setIsAddingEmail(true);
      await addAuthorizedEmail(newEmail);
      setNewEmail("");
    } catch (error) {
      console.error("Error adding email:", error);
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      await removeAuthorizedEmail(email);
    } catch (error) {
      console.error("Error removing email:", error);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage application settings and users</p>
        </header>

        <Tabs 
          defaultValue="authorized-users" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="authorized-users">Authorized Users</TabsTrigger>
            <TabsTrigger value="user-roles">User Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="authorized-users" className="space-y-4">
            <NeuCard className="p-6">
              <h2 className="text-2xl font-bold mb-6">Authorized Users</h2>
              
              <form onSubmit={handleAddEmail} className="mb-6 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email to authorize"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isAddingEmail || !newEmail.trim()}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isAddingEmail ? 'Adding...' : 'Add Email'}
                </Button>
              </form>
              
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Authorized Email List</h3>
                {authorizedEmails.length === 0 ? (
                  <p className="text-muted-foreground">No authorized emails yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {authorizedEmails.map((email) => (
                      <li 
                        key={email} 
                        className="flex justify-between items-center p-3 bg-neugray-50 dark:bg-gray-800 rounded-md"
                      >
                        <span>{email}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </NeuCard>
          </TabsContent>
          
          <TabsContent value="user-roles" className="space-y-4">
            <RoleManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
