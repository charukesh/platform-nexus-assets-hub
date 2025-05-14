
import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ className }) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 py-2 px-4 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-center text-sm border-t border-amber-200 dark:border-amber-800",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle size={16} />
        <p>This platform is actively under development and may experience glitches or unexpected behavior.</p>
      </div>
    </div>
  );
};

export default Disclaimer;
