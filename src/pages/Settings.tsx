import React, { useState } from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, RefreshCw, Monitor, Database, Save, Mail, Palette } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import DangerZone from "@/components/settings/DangerZone";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator"
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    platformUpdates: true,
    assetChanges: true,
    weeklyReports: false,
  });

  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    theme: theme,
    sidebarCollapsed: false,
    compactMode: false,
    highContrastMode: false,
  });

  // Data settings
  const [dataSettings, setDataSettings] = useState({
    dataRefreshRate: "30",
    autoBackup: true,
    analyticsCollection: true,
    dataRetention: "90"
  });

  const handleSaveSettings = (settingType: string) => {
    if (settingType === 'appearance') {
      setTheme(themeSettings.theme as "light" | "dark" | "system");
    }
    
    toast({
      title: "Settings saved",
      description: `Your ${settingType} settings have been updated`,
    });
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage application preferences</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="neu-flat bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="account" className="data-[state=active]:neu-pressed dark:data-[state=active]:bg-gray-700 flex gap-2 items-center">
              <User size={16} />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:neu-pressed dark:data-[state=active]:bg-gray-700 flex gap-2 items-center">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:neu-pressed dark:data-[state=active]:bg-gray-700 flex gap-2 items-center">
              <Palette size={16} />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:neu-pressed dark:data-[state=active]:bg-gray-700 flex gap-2 items-center">
              <Database size={16} />
              <span>Data Management</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
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
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NeuCard className="dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bell className="text-primary dark:text-blue-400" size={20} />
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="platform-updates" className="text-base">Platform Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified when platforms are updated</p>
                  </div>
                  <Switch 
                    id="platform-updates" 
                    checked={notificationSettings.platformUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, platformUpdates: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="asset-changes" className="text-base">Asset Changes</Label>
                    <p className="text-sm text-muted-foreground">Get notified when assets are modified</p>
                  </div>
                  <Switch 
                    id="asset-changes" 
                    checked={notificationSettings.assetChanges}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, assetChanges: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports" className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                  </div>
                  <Switch 
                    id="weekly-reports" 
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                  />
                </div>
                
                <div className="pt-4">
                  <NeuButton 
                    onClick={() => handleSaveSettings('notification')}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Preferences
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
            
            <NeuCard className="dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="text-primary dark:text-blue-400" size={20} />
                Email Templates
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">Customize notification email templates</p>
                <NeuButton variant="outline">Edit Email Templates</NeuButton>
              </div>
            </NeuCard>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <NeuCard className="dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="text-primary dark:text-blue-400" size={20} />
                Theme Settings
              </h2>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={themeSettings.theme}
                    onValueChange={(value) => setThemeSettings({...themeSettings, theme: value as "light" | "dark" | "system"})}
                  >
                    <SelectTrigger className="bg-white border-none neu-flat hover:shadow-neu-pressed dark:bg-gray-700">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sidebar-collapsed" className="text-base">Sidebar Collapsed by Default</Label>
                    <p className="text-sm text-muted-foreground">Start with a collapsed sidebar</p>
                  </div>
                  <Switch 
                    id="sidebar-collapsed" 
                    checked={themeSettings.sidebarCollapsed}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, sidebarCollapsed: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode" className="text-base">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use smaller spacing throughout the UI</p>
                  </div>
                  <Switch 
                    id="compact-mode" 
                    checked={themeSettings.compactMode}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, compactMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast" className="text-base">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch 
                    id="high-contrast" 
                    checked={themeSettings.highContrastMode}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, highContrastMode: checked})}
                  />
                </div>
                
                <div className="pt-4">
                  <NeuButton 
                    onClick={() => handleSaveSettings('appearance')}
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
                <Monitor className="text-primary dark:text-blue-400" size={20} />
                Layout Preferences
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">Configure workspace layout options</p>
                <div className="grid grid-cols-2 gap-4">
                  <NeuButton variant="outline">Reset to Default</NeuButton>
                  <NeuButton variant="outline">Advanced Settings</NeuButton>
                </div>
              </div>
            </NeuCard>
          </TabsContent>
          
          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <NeuCard className="dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="text-primary dark:text-blue-400" size={20} />
                Data Settings
              </h2>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="data-refresh">Data Refresh Rate (minutes)</Label>
                  <Input 
                    id="data-refresh" 
                    type="number"
                    className="bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-700"
                    value={dataSettings.dataRefreshRate}
                    onChange={(e) => setDataSettings({...dataSettings, dataRefreshRate: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                  <Input 
                    id="data-retention" 
                    type="number"
                    className="bg-white border-none neu-pressed focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-700"
                    value={dataSettings.dataRetention}
                    onChange={(e) => setDataSettings({...dataSettings, dataRetention: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup" className="text-base">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Regularly backup your data</p>
                  </div>
                  <Switch 
                    id="auto-backup" 
                    checked={dataSettings.autoBackup}
                    onCheckedChange={(checked) => setDataSettings({...dataSettings, autoBackup: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics-collection" className="text-base">Analytics Collection</Label>
                    <p className="text-sm text-muted-foreground">Collect usage data to improve the application</p>
                  </div>
                  <Switch 
                    id="analytics-collection" 
                    checked={dataSettings.analyticsCollection}
                    onCheckedChange={(checked) => setDataSettings({...dataSettings, analyticsCollection: checked})}
                  />
                </div>
                
                <div className="pt-4">
                  <NeuButton 
                    onClick={() => handleSaveSettings('data')}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Settings
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
            
            <NeuCard className="dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="text-primary dark:text-blue-400" size={20} />
                Data Operations
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">Manage your application data</p>
                <div className="grid grid-cols-2 gap-4">
                  <NeuButton variant="outline">Export All Data</NeuButton>
                  <NeuButton variant="outline">Import Data</NeuButton>
                  <NeuButton variant="outline">Create Backup</NeuButton>
                  <NeuButton variant="outline" className="text-red-500">Clear Cache</NeuButton>
                </div>
              </div>
            </NeuCard>
            
            <DangerZone />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
