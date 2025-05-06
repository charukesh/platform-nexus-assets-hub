
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { INDUSTRY_OPTIONS } from "@/types/platform";
import LogoUpload from "@/components/platform/LogoUpload";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    industry: string;
    description: string;
    premium_users: number | null;
    mau: string;
    dau: string;
    logo_url?: string | null;
    audience_data: {
      platform_specific_targeting?: string[];
    };
  };
  handleChange: (field: string, value: any) => void;
  handleAudienceDataChange: (field: string, value: any) => void;
  platformId: string | undefined;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ 
  formData, 
  handleChange, 
  handleAudienceDataChange,
  platformId 
}) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <LogoUpload
          currentLogoUrl={formData.logo_url}
          onUpload={(url) => handleChange('logo_url', url)}
          platformId={platformId || 'new'}
        />
        
        <div>
          <Label htmlFor="name">Platform Name*</Label>
          <NeuInput
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Platform Description</Label>
          <NeuInput
            id="description"
            as="textarea"
            rows={4}
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter a description of the platform"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry*</Label>
          <Select 
            value={formData.industry}
            onValueChange={(value) => handleChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Category Blocks</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {INDUSTRY_OPTIONS.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={formData.audience_data.platform_specific_targeting?.includes(category)}
                  onCheckedChange={(checked) => {
                    const current = formData.audience_data.platform_specific_targeting || [];
                    const updated = checked
                      ? [...current, category]
                      : current.filter(c => c !== category);
                    handleAudienceDataChange('platform_specific_targeting', updated);
                  }}
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
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
    </NeuCard>
  );
};

export default BasicInfoSection;
