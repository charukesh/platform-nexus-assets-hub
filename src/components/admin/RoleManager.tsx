import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, UserX, Shield, PenTool, Layout } from "lucide-react";

type UserWithRoles = {
  id: string;
  email: string;
  roles: string[];
  created_at?: string;
};

type UserRole = 'admin' | 'organizer' | 'media_planner';

// Define the shape of user role data returned from the database
interface UserRoleData {
  user_id: string;
  email: string;
  role: string;
}

// Define the shape of authorized users data
interface AuthorizedUserData {
  email: string;
  id?: string;
  created_at?: string;
}

const RoleManager = () => {
  const { isAdmin, addUserRole, removeUserRole } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("media_planner");
  const [assigningRole, setAssigningRole] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all authorized users
      const { data: authorizedUsers, error: authError } = await supabase
        .from('authorized_users')
        .select('email, id, created_at');
        
      if (authError) {
        throw authError;
      }
      
      // Get all users with roles from the user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, email, role');
        
      if (rolesError) {
        throw rolesError;
      }
      
      // Create a map of user IDs to their roles
      const userRolesMap: Record<string, { email: string, roles: string[] }> = {};
      
      // Ensure userRoles is treated as an array of UserRoleData
      const typedUserRoles = userRoles as UserRoleData[];
      
      typedUserRoles.forEach(ur => {
        if (!userRolesMap[ur.user_id]) {
          userRolesMap[ur.user_id] = { email: ur.email, roles: [] };
        }
        userRolesMap[ur.user_id].roles.push(ur.role);
      });
      
      // Add authorized users who might not have roles yet
      const allUsers: UserWithRoles[] = Object.keys(userRolesMap).map(userId => ({
        id: userId,
        email: userRolesMap[userId].email,
        roles: userRolesMap[userId].roles
      }));
      
      // Add authorized users who don't have roles yet
      if (authorizedUsers) {
        // Properly type the authorizedUsers data
        const typedAuthorizedUsers = authorizedUsers as AuthorizedUserData[];
        
        typedAuthorizedUsers.forEach(au => {
          if (au && au.email) {
            const existingUser = allUsers.find(u => u.email.toLowerCase() === au.email.toLowerCase());
            if (!existingUser) {
              // This user is authorized but doesn't have roles assigned yet
              allUsers.push({
                id: au.id || '', // Use the id from the authorized_users table if available
                email: au.email,
                roles: []
              });
            }
          }
        });
      }
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users and roles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignRole = async () => {
    try {
      if (!newUserEmail.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return;
      }
      
      setAssigningRole(true);
      
      // First check if user exists in auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      const authUser = authUsers.users.find(
        u => u.email?.toLowerCase() === newUserEmail.toLowerCase()
      );
      
      if (!authUser) {
        // User not found in auth
        toast({
          title: "User Not Found",
          description: "This user must sign in at least once before you can assign roles.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the user to authorized_users if not already there
      const { error: insertAuthError } = await supabase
        .from('authorized_users')
        .insert({ email: newUserEmail.toLowerCase().trim() })
        .select()
        .single();
        
      // Ignore "duplicate key" errors
      if (insertAuthError && !insertAuthError.message.includes("duplicate key")) {
        throw insertAuthError;
      }
      
      // Assign the selected role
      await addUserRole(authUser.id, newUserEmail, selectedRole);
      
      // Clear the form
      setNewUserEmail("");
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAssigningRole(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    try {
      await removeUserRole(userId, role);
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };

  if (!isAdmin) {
    return (
      <NeuCard className="p-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-xl font-medium">Admin Access Required</h3>
          <p className="text-muted-foreground mt-2">
            You need administrator privileges to access this feature.
          </p>
        </div>
      </NeuCard>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'organizer':
        return <PenTool className="h-4 w-4" />;
      case 'media_planner':
        return <Layout className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'organizer':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'media_planner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <NeuCard className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Role Management</h2>
      
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-medium">Assign New Role</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="User Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="media_planner">Media Planner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAssignRole} 
            disabled={assigningRole}
            className="w-full md:w-auto"
          >
            {assigningRole ? "Assigning..." : "Assign Role"}
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:w-1/2"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id || `temp-${index}-${user.email}`}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                          <span className="text-muted-foreground text-sm">No roles assigned</span>
                        ) : (
                          user.roles.map(role => (
                            <span 
                              key={role} 
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeClass(role)}`}
                            >
                              {getRoleIcon(role)}
                              {role}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.roles.map(role => (
                          <Button
                            key={role}
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRole(user.id, role as UserRole)}
                            disabled={!user.id}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Remove {role}
                          </Button>
                        ))}
                        {user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchUsers()}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </NeuCard>
  );
};

export default RoleManager;
