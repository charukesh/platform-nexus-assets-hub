
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { FormDataType, blockedCategories } from "@/utils/platformFormUtils";

interface RestrictionsStepProps {
  formData: FormDataType;
  handleCheckboxToggle: (category: string, field: string, value: string) => void;
  handleRestrictionsChange: (field: keyof FormDataType['restrictions'], value: any) => void;
}

const RestrictionsStep: React.FC<RestrictionsStepProps> = ({
  formData,
  handleCheckboxToggle,
  handleRestrictionsChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Blocked Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {blockedCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`block-${category}`}
                checked={formData.restrictions.blockedCategories.includes(category)}
                onCheckedChange={(checked) => handleCheckboxToggle('restrictions', 'blockedCategories', category)}
              />
              <label 
                htmlFor={`block-${category}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Minimum Spend (in USD)</h3>
        <div className="flex items-center space-x-2">
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[formData.restrictions.minimumSpend]}
            onValueChange={(value) => handleRestrictionsChange('minimumSpend', value[0])}
            className="flex-1"
          />
          <span className="w-24 text-center">
            ${formData.restrictions.minimumSpend.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Additional Notes</h3>
        <Textarea
          id="did-you-know"
          placeholder="Add any additional notes or 'Did You Know' facts about this platform..."
          className="bg-white border-none neu-pressed focus-visible:ring-offset-0 resize-none h-32"
          value={formData.restrictions.didYouKnow}
          onChange={(e) => handleRestrictionsChange('didYouKnow', e.target.value)}
        />
      </div>
    </div>
  );
};

export { RestrictionsStep, type RestrictionsStepProps };
