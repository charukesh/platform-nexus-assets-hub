
import React from "react";
import { cn } from "@/lib/utils";

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const NeuButton: React.FC<NeuButtonProps> = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        "font-medium rounded-lg transition-all duration-200 flex items-center justify-center",
        variant === "primary" && "text-white bg-primary hover:bg-primary/90 neu-btn dark:bg-blue-600 dark:hover:bg-blue-700",
        variant === "secondary" && "text-foreground bg-neugray-200 hover:bg-neugray-300 neu-btn dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
        variant === "outline" && "border border-input bg-background hover:bg-accent neu-btn dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white",
        size === "sm" && "text-xs px-3 py-1.5",
        size === "md" && "text-sm px-4 py-2",
        size === "lg" && "text-base px-5 py-2.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeuButton;
