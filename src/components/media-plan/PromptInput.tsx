
import React from "react";
import NeuInput from "@/components/NeuInput";
import NeuButton from "@/components/NeuButton";
import { Brain } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          What kind of media plan would you like to generate?
        </label>
        <NeuInput
          as="textarea"
          placeholder="e.g., Create a media plan for a new fitness app launch targeting young professionals in urban areas"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>

      <NeuButton
        onClick={onGenerate}
        disabled={isGenerating || !prompt}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Generating Plan...
          </>
        ) : (
          <>
            <Brain className="mr-2" size={20} />
            Generate Plan
          </>
        )}
      </NeuButton>
    </div>
  );
};

export default PromptInput;
