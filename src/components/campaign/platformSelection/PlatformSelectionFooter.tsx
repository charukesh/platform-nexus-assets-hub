
import React from "react";

interface PlatformSelectionFooterProps {
  selectedPlatforms: string[];
}

const PlatformSelectionFooter: React.FC<PlatformSelectionFooterProps> = ({ 
  selectedPlatforms 
}) => {
  if (selectedPlatforms.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <p className="text-green-700 dark:text-green-400">
        <span className="font-medium">
          {selectedPlatforms.length} platform
          {selectedPlatforms.length !== 1 ? "s" : ""} selected
        </span>{" "}
        for your campaign
      </p>
    </div>
  );
};

export default PlatformSelectionFooter;
