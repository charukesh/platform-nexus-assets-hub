import React, { ReactNode, useState } from 'react';
import NeuButton from "@/components/NeuButton";
import { CheckCircle } from "lucide-react";

interface Step {
  title: string;
  content: ReactNode;
  validator?: () => boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  isSubmitting = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    // Check if this step has a validator
    const currentValidator = steps[currentStep].validator;
    
    if (currentValidator && !currentValidator()) {
      // Validation failed, don't proceed
      return;
    }
    
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    // If we're at the last step, call onComplete
    if (currentStep === steps.length - 1) {
      onComplete();
      return;
    }
    
    // Otherwise, go to next step
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Step progress indicator */}
      <div className="flex items-center mb-8 w-full">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div 
              className={`
                flex items-center justify-center rounded-full w-8 h-8 text-sm
                ${index === currentStep ? 'neu-pressed bg-primary text-white' : 
                  completedSteps.includes(index) ? 'neu-flat bg-primary/10 text-primary' : 'neu-flat'}
              `}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle size={16} />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-2 ${
                  completedSteps.includes(index) ? 'bg-primary' : 'bg-neugray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Step title */}
      <h2 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h2>
      
      {/* Step content */}
      <div className="mb-6">
        {steps[currentStep].content}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <NeuButton 
          type="button" 
          variant="outline" 
          onClick={currentStep === 0 ? onCancel : handleBack}
          disabled={isSubmitting}
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </NeuButton>
        
        <NeuButton 
          type="button" 
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </span>
          ) : currentStep === steps.length - 1 ? (
            'Complete'
          ) : (
            'Next'
          )}
        </NeuButton>
      </div>
    </div>
  );
};

export default MultiStepForm;
