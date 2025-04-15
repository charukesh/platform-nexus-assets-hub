
import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: "input" | "textarea";
  rows?: number;
  className?: string;
}

const NeuInput: React.FC<NeuInputProps> = ({ 
  as = "input", 
  className, 
  rows = 3,
  ...props 
}) => {
  const baseStyles = "w-full bg-white border border-gray-300 rounded-md shadow-inner neu-input-inner dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/50";
  
  if (as === "textarea") {
    return (
      <Textarea
        className={cn(baseStyles, "min-h-[80px] py-2 px-3", className)}
        rows={rows}
        {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
      />
    );
  }
  
  return (
    <Input
      className={cn(baseStyles, className)}
      {...props as React.InputHTMLAttributes<HTMLInputElement>}
    />
  );
};

export default NeuInput;
