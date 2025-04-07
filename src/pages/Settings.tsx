
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Palette, Database } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import DataSettings from "@/components/settings/DataSettings";

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
          <TabsContent value="account">
            <AccountSettings 
              accountSettings={accountSettings}
              setAccountSettings={setAccountSettings}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationSettings 
              notificationSettings={notificationSettings}
              setNotificationSettings={setNotificationSettings}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <AppearanceSettings 
              themeSettings={themeSettings}
              setThemeSettings={setThemeSettings}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
          
          {/* Data Management Tab */}
          <TabsContent value="data">
            <DataSettings 
              dataSettings={dataSettings}
              setDataSettings={setDataSettings}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
