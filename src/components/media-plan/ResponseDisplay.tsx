
import React from "react";
import NeuCard from "@/components/NeuCard";

interface ResponseDisplayProps {
  response: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  if (!response) return null;

  return (
    <NeuCard className="prose max-w-none">
      <div className="whitespace-pre-wrap font-mono text-sm">
        {response}
      </div>
    </NeuCard>
  );
};

export default ResponseDisplay;
