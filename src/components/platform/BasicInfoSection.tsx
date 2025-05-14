
import React from 'react';
import NeuCard from "@/components/NeuCard";
import NeuInput from "@/components/NeuInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDUSTRY_OPTIONS } from "@/types/platform";
import LogoUpload from "@/components/platform/LogoUpload";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    industry: string;
    description?: string;
    logo_url?: string | null;
  };
  handleChange: (field: string, value: any) => void;
  platformId: string | undefined;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ 
  formData, 
  handleChange,
  platformId 
}) => {
  return (
    <NeuCard>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-3/4">
            <Label htmlFor="name">Platform Name*</Label>
            <NeuInput
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Enter platform name"
            />
          </div>
          <div className="w-full md:w-1/4">
            <Label>Platform Logo</Label>
            <LogoUpload
              currentLogoUrl={formData.logo_url}
              onUpload={(url) => handleChange('logo_url', url)}
              platformId={platformId || 'new'}
            />
          </div>
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
      </div>
    </NeuCard>
  );
};

export default BasicInfoSection;
