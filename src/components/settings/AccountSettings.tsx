
import React from "react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Save } from "lucide-react";

interface AccountSettingsProps {
  accountSettings: {
    name: string;
    email: string;
    role: string;
  };
  setAccountSettings: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    role: string;
  }>>;
  handleSaveSettings: (settingType: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ 
  accountSettings, 
  setAccountSettings, 
  handleSaveSettings 
}) => {
  return (
    <div className="space-y-6">
      <NeuCard className="dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="text-primary dark:text-blue-400" size={20} />
          Account Information
        </h2>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              className="bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-700"
              value={accountSettings.name}
              onChange={(e) => setAccountSettings({...accountSettings, name: e.target.value})}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              className="bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-700"
              value={accountSettings.email}
              onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={accountSettings.role}
              onValueChange={(value) => setAccountSettings({...accountSettings, role: value})}
            >
              <SelectTrigger className="bg-white border-none neu-flat hover:shadow-neu-pressed dark:bg-gray-700">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <NeuButton 
              onClick={() => handleSaveSettings('account')}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </NeuButton>
          </div>
        </div>
      </NeuCard>
      
      <NeuCard className="dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="text-primary dark:text-blue-400" size={20} />
          Security
        </h2>
        
        <div className="space-y-4">
          <NeuButton variant="outline">Change Password</NeuButton>
          <NeuButton variant="outline">Enable Two-Factor Authentication</NeuButton>
        </div>
      </NeuCard>
    </div>
  );
};

export default AccountSettings;
