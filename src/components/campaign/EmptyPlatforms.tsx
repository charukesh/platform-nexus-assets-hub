
import React from "react";

interface EmptyPlatformsProps {
  message?: string;
}

const EmptyPlatforms: React.FC<EmptyPlatformsProps> = ({ 
  message = "No platforms selected for this campaign" 
}) => {
  return (
    <div className="text-center py-10 bg-neugray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Please select platforms in the previous step or check your campaign criteria
      </p>
    </div>
  );
};

export default EmptyPlatforms;
