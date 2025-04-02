
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
        "p-5 transition-all", 
        variant === "flat" && "neu-flat dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700",
        variant === "pressed" && "neu-pressed dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700",
        variant === "convex" && "neu-convex dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default NeuCard;
