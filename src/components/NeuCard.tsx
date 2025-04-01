
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
        variant === "flat" && "neu-flat",
        variant === "pressed" && "neu-pressed",
        variant === "convex" && "neu-convex",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default NeuCard;
