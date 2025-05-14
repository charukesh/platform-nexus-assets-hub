import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { DeviceSplit } from "@/types/platform";
import { Slider } from "@/components/ui/slider";

interface PerformanceMetricsSectionProps {
  formData: {
    mau: string;
    dau: string;
    premium_users: number | null;
    est_reach?: number | null;
    impressions?: number | null;
    device_split: DeviceSplit;
  };
  handleChange: (field: string, value: any) => void;
  handleDeviceSplitChange: (deviceSplit: DeviceSplit) => void;
}

const PerformanceMetricsSection: React.FC<PerformanceMetricsSectionProps> = ({ 
  formData, 
  handleChange,
  handleDeviceSplitChange
}) => {
  const updateDeviceSplit = (type: 'ios' | 'android' | 'web', value: number) => {
    const newDeviceSplit = { ...formData.device_split };
    
    // Update the specified type
    newDeviceSplit[type] = value;
    
    // Normalize other values to ensure total is 100%
    const otherTypes = Object.keys(newDeviceSplit).filter(k => k !== type) as Array<'ios' | 'android' | 'web'>;
    
    if (otherTypes.length === 1) {
      // If there are only two types, simply set the other to the remaining percentage
      newDeviceSplit[otherTypes[0]] = 100 - value;
    } else if (otherTypes.length === 2) {
      // If all three types exist, distribute the remaining equally among the other two
      const remaining = 100 - value;
      const originalSum = otherTypes.reduce((sum, key) => sum + (newDeviceSplit[key] || 0), 0);
      
      if (originalSum === 0) {
        // If the other two are both 0, distribute equally
        newDeviceSplit[otherTypes[0]] = remaining / 2;
        newDeviceSplit[otherTypes[1]] = remaining / 2;
      } else {
        // Otherwise, distribute proportionally
        const ratio = remaining / originalSum;
        newDeviceSplit[otherTypes[0]] = Math.round((newDeviceSplit[otherTypes[0]] || 0) * ratio);
        newDeviceSplit[otherTypes[1]] = remaining - newDeviceSplit[otherTypes[0]];
      }
    }
    
    handleDeviceSplitChange(newDeviceSplit);
  };

  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
            <NeuInput
              id="mau"
              type="text"
              value={formData.mau}
              onChange={(e) => handleChange('mau', e.target.value)}
              placeholder="e.g., 22,000,000"
            />
          </div>
          <div>
            <Label htmlFor="dau">Daily Active Users (DAU)</Label>
            <NeuInput
              id="dau"
              type="text"
              value={formData.dau}
              onChange={(e) => handleChange('dau', e.target.value)}
              placeholder="e.g., 10,000,000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="est_reach">Estimated Reach</Label>
            <NeuInput
              id="est_reach"
              type="number"
              min="0"
              value={formData.est_reach || ''}
              onChange={(e) => handleChange('est_reach', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Number of unique users reached"
            />
          </div>
          <div>
            <Label htmlFor="impressions">Impressions</Label>
            <NeuInput
              id="impressions"
              type="number"
              min="0"
              value={formData.impressions || ''}
              onChange={(e) => handleChange('impressions', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Number of ad views"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="premium_users">Premium Users (%)</Label>
          <NeuInput
            id="premium_users"
            type="number"
            min="0"
            max="100"
            value={formData.premium_users || ''}
            onChange={(e) => handleChange('premium_users', e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div>
          <Label className="block mb-2">Device Distribution</Label>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="ios">iOS ({formData.device_split.ios}%)</Label>
                <span className="text-sm text-muted-foreground">{formData.device_split.ios}%</span>
              </div>
              <Slider
                id="ios"
                min={0}
                max={100}
                step={1}
                value={[formData.device_split.ios]}
                onValueChange={(value) => updateDeviceSplit('ios', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="android">Android ({formData.device_split.android}%)</Label>
                <span className="text-sm text-muted-foreground">{formData.device_split.android}%</span>
              </div>
              <Slider
                id="android"
                min={0}
                max={100}
                step={1}
                value={[formData.device_split.android]}
                onValueChange={(value) => updateDeviceSplit('android', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="web">Web ({formData.device_split.web || 0}%)</Label>
                <span className="text-sm text-muted-foreground">{formData.device_split.web || 0}%</span>
              </div>
              <Slider
                id="web"
                min={0}
                max={100}
                step={1}
                value={[formData.device_split.web || 0]}
                onValueChange={(value) => updateDeviceSplit('web', value[0])}
              />
            </div>
          </div>
        </div>
      </div>
    </NeuCard>
  );
};

export default PerformanceMetricsSection;
