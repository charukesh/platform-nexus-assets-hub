
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlatformAutoSuggestToggleProps {
  autoSuggestEnabled: boolean;
  toggleAutoSuggest: () => void;
}

const PlatformAutoSuggestToggle: React.FC<PlatformAutoSuggestToggleProps> = ({
  autoSuggestEnabled,
  toggleAutoSuggest,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="auto-suggest"
        checked={autoSuggestEnabled}
        onCheckedChange={toggleAutoSuggest}
      />
      <label
        htmlFor="auto-suggest"
        className="text-sm cursor-pointer flex items-center gap-1"
      >
        Auto-suggest platforms
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                The system will automatically suggest appropriate platforms
                based on your campaign requirements
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </label>
    </div>
  );
};

export default PlatformAutoSuggestToggle;
