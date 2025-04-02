
import React from "react";
import { cn } from "@/lib/utils";

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "flat" | "pressed" | "convex";
  className?: string;
}

const NeuCard: React.FC<NeuCardProps> = ({ 
  children, 
  variant = "flat", 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "p-5", 
        variant === "flat" && "neu-flat dark:bg-gray-800 dark:shadow-none",
        variant === "pressed" && "neu-pressed dark:bg-gray-800 dark:shadow-none",
        variant === "convex" && "neu-convex dark:bg-gray-800 dark:shadow-none",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default NeuCard;
