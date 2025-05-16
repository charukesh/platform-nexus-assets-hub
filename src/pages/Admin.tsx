
import React, { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, X, RefreshCw, Edit, Check } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuthorizedUser {
  email: string;
  role: UserRole;
}

const Admin = () => {
  const { user, loading, isAdmin, addAuthorizedEmail, removeAuthorizedEmail, updateUserRole } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("media_planner");
  const [refreshing, setRefreshing] = useState(false);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("media_planner");
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);
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

    // Fetch users with their roles directly from the database
    fetchUsersFromDb();
  }, [user, loading, isAdmin, navigate]);

  const fetchUsersFromDb = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email, role');
      
      if (error) {
        console.error('Error fetching users from DB:', error);
        toast({
          title: "Error",
          description: "Failed to fetch authorized users from database.",
          variant: "destructive"
        });
      } else {
        const users = data.map(item => ({
          email: item.email.toLowerCase().trim(),
          role: (item.role || 'media_planner') as UserRole
        }));
        console.log("Users from database:", users);
        setAuthorizedUsers(users);
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

  const handleAddUser = async () => {
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
      setAddingUser(true);
      await addAuthorizedEmail(trimmedEmail, newRole);
      setNewEmail("");
      setNewRole("media_planner");
      
      // Refresh the list from DB after adding
      fetchUsersFromDb();
    } catch (error) {
      console.error("Error adding email:", error);
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    try {
      setRemovingUser(email);
      const success = await removeAuthorizedEmail(email);
      
      if (success) {
        // Update local state to immediately reflect the change
        setAuthorizedUsers(prev => prev.filter(user => user.email !== email));
        toast({
          title: "User Removed",
          description: `${email} has been removed successfully.`
        });
      }
    } catch (error) {
      console.error("Error removing email:", error);
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemovingUser(null);
    }
  };

  const handleEditUser = (email: string, currentRole: UserRole) => {
    setEditingUser(email);
    setEditRole(currentRole);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    
    try {
      await updateUserRole(editingUser, editRole);
      
      // Update local state to immediately reflect the change
      setAuthorizedUsers(prev => prev.map(user => 
        user.email === editingUser ? { ...user, role: editRole } : user
      ));
      
      setEditingUser(null);
      
      toast({
        title: "Role Updated",
        description: `Role for ${editingUser} has been updated to ${editRole}.`
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const roleLabels: Record<UserRole, string> = {
    'admin': 'Admin',
    'media_manager': 'Media Manager',
    'media_planner': 'Media Planner'
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
              Control which email addresses can access the application and assign roles to users.
              Only users with emails listed below will be able to log in and use the platform.
              A welcome email will be sent when you add new users.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <Input
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full"
                  disabled={addingUser}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={newRole} 
                  onValueChange={(value) => setNewRole(value as UserRole)}
                  disabled={addingUser}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="media_manager">Media Manager</SelectItem>
                    <SelectItem value="media_planner">Media Planner</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddUser} 
                  disabled={addingUser}
                >
                  {addingUser ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Authorized Users</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsersFromDb}
                  disabled={refreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </Button>
              </div>
              
              {authorizedUsers.length === 0 ? (
                <p className="text-muted-foreground italic">No authorized users yet.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizedUsers.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Mail size={16} className="text-muted-foreground" />
                            {user.email}
                          </TableCell>
                          <TableCell>
                            {editingUser === user.email ? (
                              <Select 
                                value={editRole} 
                                onValueChange={(value) => setEditRole(value as UserRole)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="media_manager">Media Manager</SelectItem>
                                  <SelectItem value="media_planner">Media Planner</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded-full 
                                ${user.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 
                                user.role === 'media_manager' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
                                {roleLabels[user.role] || 'Media Planner'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingUser === user.email ? (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleSaveRole}
                                >
                                  <Check size={16} />
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditUser(user.email, user.role)}
                                >
                                  <Edit size={16} />
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.email)}
                                  disabled={removingUser === user.email}
                                >
                                  {removingUser === user.email ? (
                                    <RefreshCw size={16} className="animate-spin mr-1" />
                                  ) : (
                                    <X size={16} />
                                  )}
                                  Remove
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p><strong>Role permissions:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Admin:</strong> Full access to all features including user management.</li>
                  <li><strong>Media Manager:</strong> Can view and edit platforms and assets.</li>
                  <li><strong>Media Planner:</strong> Can view platforms and assets, and create media plans.</li>
                </ul>
                <p className="mt-4"><strong>Note:</strong> As the admin (charu@thealteroffice.com), you will always have admin access regardless of this list.</p>
              </div>
            </div>
          </NeuCard>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Admin;
