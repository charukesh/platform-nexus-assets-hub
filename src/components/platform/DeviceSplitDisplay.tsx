
import NeuCard from "@/components/NeuCard";
import { Label } from "@/components/ui/label";
import { DeviceSplit } from "@/types/platform";

interface DeviceSplitDisplayProps {
  deviceSplit: DeviceSplit;
}

export const DeviceSplitDisplay = ({ deviceSplit }: DeviceSplitDisplayProps) => {
  return (
    <NeuCard>
      <h3 className="text-lg font-bold mb-4">Device Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>iOS</Label>
          <p className="text-2xl font-bold">{deviceSplit.ios}%</p>
        </div>
        <div>
          <Label>Android</Label>
          <p className="text-2xl font-bold">{deviceSplit.android}%</p>
        </div>
        {deviceSplit.web !== undefined && (
          <div>
            <Label>Web</Label>
            <p className="text-2xl font-bold">{deviceSplit.web}%</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 h-2 bg-neugray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${deviceSplit.ios}%` }}
        />
      </div>
    </NeuCard>
  );
};
