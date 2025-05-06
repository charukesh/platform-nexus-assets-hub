
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { DeviceSplit } from "@/types/platform";

interface DeviceDistributionSectionProps {
  deviceSplit: DeviceSplit;
  onDeviceSplitChange: (deviceSplit: DeviceSplit) => void;
}

const DeviceDistributionSection: React.FC<DeviceDistributionSectionProps> = ({
  deviceSplit,
  onDeviceSplitChange
}) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Device Distribution</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ios">iOS (%)</Label>
          <NeuInput
            id="ios"
            type="number"
            min="0"
            max="100"
            value={deviceSplit.ios}
            onChange={(e) => onDeviceSplitChange({
              ...deviceSplit,
              ios: parseInt(e.target.value) || 0
            })}
          />
        </div>
        <div>
          <Label htmlFor="android">Android (%)</Label>
          <NeuInput
            id="android"
            type="number"
            min="0"
            max="100"
            value={deviceSplit.android}
            onChange={(e) => onDeviceSplitChange({
              ...deviceSplit,
              android: parseInt(e.target.value) || 0
            })}
          />
        </div>
        <div>
          <Label htmlFor="web">Web (%)</Label>
          <NeuInput
            id="web"
            type="number"
            min="0"
            max="100"
            value={deviceSplit.web || 0}
            onChange={(e) => onDeviceSplitChange({
              ...deviceSplit,
              web: parseInt(e.target.value) || 0
            })}
          />
        </div>
      </div>
    </NeuCard>
  );
};

export default DeviceDistributionSection;
