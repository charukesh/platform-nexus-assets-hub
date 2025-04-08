
import React from "react";

const EmptyPlatforms: React.FC = () => {
  return (
    <div className="text-center py-10 bg-neugray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-muted-foreground">No platforms selected for this campaign</p>
      <p className="text-sm text-muted-foreground mt-2">Please select platforms in the previous step or check your campaign criteria</p>
    </div>
  );
};

export default EmptyPlatforms;
