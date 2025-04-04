
import React from "react";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TourGuideProps {
  className?: string;
}

const TourGuide: React.FC<TourGuideProps> = ({ className }) => {
  const { startOnboarding, hasSeenOnboarding } = useOnboarding();

  return (
    <div className={className}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-9 h-9 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800"
            onClick={startOnboarding}
          >
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="sr-only">Start tour guide</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Start the guided tour</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TourGuide;
