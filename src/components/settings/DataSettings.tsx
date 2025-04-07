
import React from "react";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database, RefreshCw, Save } from "lucide-react";
import DangerZone from "./DangerZone";

interface DataSettingsProps {
  dataSettings: {
    dataRefreshRate: string;
    autoBackup: boolean;
    analyticsCollection: boolean;
    dataRetention: string;
  };
  setDataSettings: React.Dispatch<React.SetStateAction<{
    dataRefreshRate: string;
    autoBackup: boolean;
    analyticsCollection: boolean;
    dataRetention: string;
  }>>;
  handleSaveSettings: (settingType: string) => void;
}

const DataSettings: React.FC<DataSettingsProps> = ({ 
  dataSettings, 
  setDataSettings, 
  handleSaveSettings 
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default DataSettings;
