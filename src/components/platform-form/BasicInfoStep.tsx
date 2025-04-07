import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FormDataType, formatPremiumUsers, industries } from "@/utils/platformFormUtils";
import { useToast } from "@/hooks/use-toast";

interface BasicInfoStepProps {
  formData: FormDataType;
  handleChange: (field: string, value: any) => void;
  handleNestedChange: (parent: keyof FormDataType, field: string, value: any) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  formData, 
  handleChange, 
  handleNestedChange 
}) => {
  const { toast } = useToast();

  const validateBasicInfo = () => {
    if (!formData.name || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Convert premium users count from millions to a percentage value
  const handlePremiumCountChange = (value: string) => {
    // Convert from millions to a raw number
    const countInMillions = parseFloat(value) || 0;
    
    // If MAU is available, convert count to percentage of MAU
    const mauValue = parseFloat(formData.mau.replace(/[^0-9.]/g, '')) || 0;
    if (mauValue > 0) {
      // Calculate percentage: (premiumUsers / MAU) * 100
      const percentage = (countInMillions / mauValue) * 100;
      handleChange('premium_users', Math.min(100, Math.max(0, percentage)));
    } else {
      // If MAU isn't available, just store the count directly
      handleChange('premium_users', countInMillions);
    }
  };

  // Get the current premium user count in millions
  const getPremiumUserCount = (): string => {
    const mauValue = parseFloat(formData.mau.replace(/[^0-9.]/g, '')) || 0;
    if (mauValue <= 0) return '';
    
    // Convert percentage to count in millions: (percentage * MAU) / 100
    const count = (formData.premium_users * mauValue) / 100;
    return count.toString();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform-name">Platform Name*</Label>
        <Input
          id="platform-name"
          placeholder="Enter platform name"
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry*</Label>
        <Select 
          required
          value={formData.industry}
          onValueChange={(value) => handleChange('industry', value)}
        >
          <SelectTrigger className="bg-white border-none neu-pressed focus:ring-offset-0">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
          <Input
            id="mau"
            placeholder="e.g., 1.2M"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={formData.mau}
            onChange={(e) => handleChange('mau', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dau">Daily Active Users (DAU)</Label>
          <Input
            id="dau"
            placeholder="e.g., 500K"
            className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
            value={formData.dau}
            onChange={(e) => handleChange('dau', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="premium-users">Premium Users</Label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Count</span>
              <Switch
                checked={formData.premium_users_display_as_percentage}
                onCheckedChange={(checked) => handleChange('premium_users_display_as_percentage', checked)}
              />
              <span className="text-xs text-muted-foreground">Percentage</span>
            </div>
          </div>
          
          {formData.premium_users_display_as_percentage ? (
            <div className="flex items-center space-x-2">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[formData.premium_users]}
                onValueChange={(value) => handleChange('premium_users', value[0])}
                className="flex-1"
              />
              <span className="w-16 text-center">
                {formatPremiumUsers(formData.premium_users, formData.premium_users_display_as_percentage, formData.mau)}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Input
                id="premium-users-count"
                placeholder="e.g., 0.5"
                className="bg-white border-none neu-pressed focus-visible:ring-offset-0"
                value={getPremiumUserCount()}
                onChange={(e) => handlePremiumCountChange(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">Millions</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Device Split (iOS/Android)</Label>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>iOS: {formData.device_split.ios}%</span>
            <span>Android: {formData.device_split.android}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[formData.device_split.ios]}
            onValueChange={(value) => {
              const ios = value[0];
              handleNestedChange('device_split', 'ios', ios);
              handleNestedChange('device_split', 'android', 100 - ios);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { BasicInfoStep, type BasicInfoStepProps };
