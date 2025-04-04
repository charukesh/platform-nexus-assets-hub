
import React from "react";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface TourGuideProps {
  className?: string;
}

const TourGuide: React.FC<TourGuideProps> = ({ className }) => {
  const { startOnboarding, hasSeenOnboarding, resetOnboardingStatus } = useOnboarding();

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full w-9 h-9 p-0 neu-flat bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800"
              onClick={() => startOnboarding()}
            >
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="sr-only">Start tour guide</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="neu-flat dark:text-white">
            <p>Start the guided tour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TourGuide;
