
import React from "react";
import { AlertCircle } from "lucide-react";

interface EmptyPlatformsProps {
  message?: string;
  error?: boolean;
}

const EmptyPlatforms: React.FC<EmptyPlatformsProps> = ({ 
  message = "No platforms selected for this campaign",
  error = false
}) => {
  return (
    <div className={`text-center py-10 ${error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-neugray-100 dark:bg-gray-800'} rounded-lg flex flex-col items-center`}>
      {error && (
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      )}
      <p className={`${error ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
        {message}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {error 
          ? "Please check the console for more details or try again later" 
          : "Please select platforms in the previous step or check your campaign criteria"}
      </p>
    </div>
  );
};

export default EmptyPlatforms;
