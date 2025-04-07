
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface DurationSelectorProps {
  duration: number;
  onChange: (duration: number) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ duration, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onChange(value);
    }
  };

  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Slider
          value={[duration]}
          min={1}
          max={90}
          step={1}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <Input
          type="number"
          min={1}
          value={duration}
          onChange={handleInputChange}
          className="w-20"
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>1 day</span>
        <span>30 days</span>
        <span>60 days</span>
        <span>90 days</span>
      </div>
    </div>
  );
};

export default DurationSelector;
