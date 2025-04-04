
import React, { useState, useEffect, useRef } from "react";
import { SkipForward, ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";

interface OnboardingTooltipProps {
  className?: string;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ className }) => {
  const { 
    isOnboarding, 
    skipOnboarding, 
    nextStep, 
    prevStep, 
    getCurrentStep,
    currentStepIndex
  } = useOnboarding();
  
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [opacity, setOpacity] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentStep = getCurrentStep();

  useEffect(() => {
    if (!isOnboarding || !currentStep) {
      setOpacity(0);
      return;
    }

    const positionTooltip = () => {
      const targetElement = document.querySelector(currentStep.target);
      
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch(currentStep.placement) {
        case "top":
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case "right":
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 10;
          break;
        case "bottom":
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case "left":
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 10;
          break;
        default:
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      }

      // Keep tooltip within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipRect.height > window.innerHeight - 10) {
        top = window.innerHeight - tooltipRect.height - 10;
      }

      setPosition({ top, left });
      setTimeout(() => setOpacity(1), 50); // Slight delay for animation
    };

    // Position on step change
    positionTooltip();

    // Handle window resize
    window.addEventListener('resize', positionTooltip);
    
    // Highlight target element
    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      targetElement.classList.add('onboarding-highlight');
    }

    return () => {
      window.removeEventListener('resize', positionTooltip);
      // Remove highlight from target element
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
    };
  }, [isOnboarding, currentStep]);

  if (!isOnboarding || !currentStep) {
    return null;
  }

  return (
    <div 
      ref={tooltipRef}
      className={cn(
        "fixed z-50 w-72 p-4 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity",
        className
      )}
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        opacity: opacity,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <button 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={skipOnboarding}
      >
        <X size={16} />
      </button>
      
      <div className="mb-3">
        <h3 className="font-semibold text-lg text-primary dark:text-blue-400">{currentStep.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{currentStep.content}</p>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={skipOnboarding}
            className="flex items-center text-xs"
          >
            <SkipForward size={14} className="mr-1" />
            Skip Tour
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentStepIndex > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={prevStep}
              className="flex items-center text-xs"
            >
              <ChevronLeft size={14} className="mr-1" />
              Back
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={nextStep}
            className="flex items-center text-xs"
          >
            Next
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
