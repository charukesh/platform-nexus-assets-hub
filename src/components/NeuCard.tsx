
import React from "react";
import { cn } from "@/lib/utils";

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "flat" | "pressed" | "convex";
  className?: string;
  gradient?: "blue" | "green" | "purple" | "orange" | "none";
}

const NeuCard: React.FC<NeuCardProps> = ({ 
  children, 
  variant = "flat", 
  gradient = "none",
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "p-5 transition-all", 
        variant === "flat" && "neu-flat",
        variant === "pressed" && "neu-pressed",
        variant === "convex" && "shadow-neu-convex",
        gradient === "blue" && "card-gradient-blue",
        gradient === "green" && "card-gradient-green",
        gradient === "purple" && "card-gradient-purple",
        gradient === "orange" && "card-gradient-orange",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default NeuCard;
