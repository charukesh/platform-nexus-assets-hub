
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import OnboardingTooltip from "@/components/OnboardingTooltip";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component that applies the layout and handles onboarding for each page
 */
const PageWrapper: React.FC<PageWrapperProps> = ({ children, className }) => {
  const location = useLocation();
  const { setCurrentScreen } = useOnboarding();

  // Update current screen in onboarding context when the route changes
  useEffect(() => {
    const path = location.pathname;
    setCurrentScreen(path);
  }, [location.pathname, setCurrentScreen]);

  return (
    <Layout>
      <div className={className}>
        {children}
        <OnboardingTooltip />
      </div>
    </Layout>
  );
};

export default PageWrapper;
