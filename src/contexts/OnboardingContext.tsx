
import React, { createContext, useContext, useState, useEffect } from "react";

type OnboardingStep = {
  id: string;
  title: string;
  content: string;
  target: string;
  placement?: "top" | "right" | "bottom" | "left";
};

type ScreenSteps = {
  [key: string]: OnboardingStep[];
};

type OnboardingContextType = {
  isOnboarding: boolean;
  currentScreen: string;
  currentStepIndex: number;
  setCurrentScreen: (screen: string) => void;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  getCurrentStep: () => OnboardingStep | null;
  hasSeenOnboarding: boolean;
  resetOnboardingStatus: () => void;
};

const defaultContext: OnboardingContextType = {
  isOnboarding: false,
  currentScreen: "/",
  currentStepIndex: 0,
  setCurrentScreen: () => {},
  startOnboarding: () => {},
  skipOnboarding: () => {},
  nextStep: () => {},
  prevStep: () => {},
  getCurrentStep: () => null,
  hasSeenOnboarding: false,
  resetOnboardingStatus: () => {},
};

export const OnboardingSteps: ScreenSteps = {
  "/": [
    {
      id: "dashboard-welcome",
      title: "Welcome to MobistackIO",
      content: "This dashboard gives you an overview of your platform's performance and recent activities.",
      target: ".dashboard-card",
      placement: "bottom",
    },
    {
      id: "navigation",
      title: "Quick Navigation",
      content: "Use the sidebar to navigate between different sections of the application.",
      target: "nav",
      placement: "right",
    },
  ],
  "/platforms": [
    {
      id: "platforms-intro",
      title: "Platform Management",
      content: "Here you can manage all your advertising platforms and their properties.",
      target: ".platforms-heading",
      placement: "bottom",
    },
    {
      id: "add-platform",
      title: "Add New Platforms",
      content: "Click here to add new advertising platforms to your account.",
      target: ".add-platform-button",
      placement: "left",
    },
  ],
  "/assets": [
    {
      id: "assets-intro",
      title: "Asset Management",
      content: "Manage all your advertising assets, including images, videos, and other media.",
      target: ".assets-heading",
      placement: "bottom",
    },
    {
      id: "asset-upload",
      title: "Upload Assets",
      content: "Click here to upload new assets for your campaigns.",
      target: ".upload-asset-button",
      placement: "left",
    },
  ],
  "/analytics": [
    {
      id: "analytics-intro",
      title: "Analytics Dashboard",
      content: "View comprehensive analytics about your platforms and campaigns.",
      target: ".analytics-heading",
      placement: "bottom",
    },
    {
      id: "chart-interaction",
      title: "Interactive Charts",
      content: "Interact with these charts to view data for different time periods.",
      target: ".analytics-chart",
      placement: "top",
    },
  ],
  "/campaigns/quotation": [
    {
      id: "campaign-intro",
      title: "Campaign Quotation",
      content: "Here you can create quotations for advertising campaigns.",
      target: ".quotation-heading",
      placement: "bottom",
    },
    {
      id: "platform-selection",
      title: "Select Platforms",
      content: "Choose which platforms to include in your campaign based on audience matching.",
      target: ".platform-selection",
      placement: "top",
    },
  ],
  "/settings": [
    {
      id: "settings-intro",
      title: "Application Settings",
      content: "Configure your application preferences and account settings.",
      target: ".settings-heading",
      placement: "bottom",
    },
    {
      id: "theme-toggle",
      title: "Theme Settings",
      content: "Toggle between light and dark mode based on your preference.",
      target: ".theme-toggle",
      placement: "left",
    },
  ],
};

const OnboardingContext = createContext<OnboardingContextType>(defaultContext);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("/");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Load onboarding status from localStorage on initial mount
  useEffect(() => {
    const hasSeenOnboardingFromStorage = localStorage.getItem("hasSeenOnboarding");
    setHasSeenOnboarding(hasSeenOnboardingFromStorage === "true");
  }, []);

  // Auto-start onboarding if user hasn't seen it and it's not already running
  useEffect(() => {
    if (!hasSeenOnboarding && !isOnboarding) {
      startOnboarding();
    }
  }, [hasSeenOnboarding]);

  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStepIndex(0);
  };

  const skipOnboarding = () => {
    setIsOnboarding(false);
    setCurrentStepIndex(0);
    localStorage.setItem("hasSeenOnboarding", "true");
    setHasSeenOnboarding(true);
  };

  const resetOnboardingStatus = () => {
    localStorage.removeItem("hasSeenOnboarding");
    setHasSeenOnboarding(false);
    startOnboarding();
  };

  const nextStep = () => {
    const steps = OnboardingSteps[currentScreen] || [];
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    } else if (currentStepIndex >= steps.length - 1) {
      // If this is the last step of the last screen, complete onboarding
      skipOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  };

  const getCurrentStep = (): OnboardingStep | null => {
    const steps = OnboardingSteps[currentScreen] || [];
    return steps[currentStepIndex] || null;
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentScreen,
        currentStepIndex,
        setCurrentScreen,
        startOnboarding,
        skipOnboarding,
        nextStep,
        prevStep,
        getCurrentStep,
        hasSeenOnboarding,
        resetOnboardingStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
