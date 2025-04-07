
import React from "react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Monitor, Save } from "lucide-react";

interface AppearanceSettingsProps {
  themeSettings: {
    theme: string;
    sidebarCollapsed: boolean;
    compactMode: boolean;
    highContrastMode: boolean;
  };
  setThemeSettings: React.Dispatch<React.SetStateAction<{
    theme: string;
    sidebarCollapsed: boolean;
    compactMode: boolean;
    highContrastMode: boolean;
  }>>;
  handleSaveSettings: (settingType: string) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ 
  themeSettings, 
  setThemeSettings, 
  handleSaveSettings 
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default AppearanceSettings;
