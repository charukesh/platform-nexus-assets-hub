
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { pathname } = useLocation();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position when route changes
    window.scrollTo(0, 0);
    
    // Play entrance animation
    if (elementRef.current) {
      elementRef.current.classList.remove("animate-fade-out");
      elementRef.current.classList.add("animate-slide-in");
    }
  }, [pathname]);

  return (
    <div 
      ref={elementRef}
      className={cn(
        "animate-slide-in transition-all duration-700 ease-in-out min-h-[80vh]",
      )}
    >
      {children}
    </div>
  );
};

export default PageTransition;
