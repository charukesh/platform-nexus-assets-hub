
import React from "react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Save } from "lucide-react";

interface NotificationSettingsProps {
  notificationSettings: {
    emailNotifications: boolean;
    platformUpdates: boolean;
    assetChanges: boolean;
    weeklyReports: boolean;
  };
  setNotificationSettings: React.Dispatch<React.SetStateAction<{
    emailNotifications: boolean;
    platformUpdates: boolean;
    assetChanges: boolean;
    weeklyReports: boolean;
  }>>;
  handleSaveSettings: (settingType: string) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  notificationSettings, 
  setNotificationSettings, 
  handleSaveSettings 
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default NotificationSettings;
