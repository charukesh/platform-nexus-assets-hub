
import React, { useState, useEffect, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import NeuInput from "@/components/NeuInput";

interface CommaSeparatedInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CommaSeparatedInput: React.FC<CommaSeparatedInputProps> = ({
  placeholder,
  value,
  onChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [valueArray, setValueArray] = useState<string[]>(
    value ? value.split(",").map(item => item.trim()).filter(Boolean) : []
  );

  // Update the internal array whenever the external value changes
  useEffect(() => {
    if (value !== valueArray.join(", ")) {
      setValueArray(
        value ? value.split(",").map(item => item.trim()).filter(Boolean) : []
      );
    }
  }, [value]);

  const addValue = (val: string) => {
    if (!val.trim()) return;
    
    const newValues = [...valueArray, val.trim()];
    setValueArray(newValues);
    onChange(newValues.join(", "));
    setInputValue("");
  };

  const removeValue = (index: number) => {
    const newValues = valueArray.filter((_, i) => i !== index);
    setValueArray(newValues);
    onChange(newValues.join(", "));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue(inputValue);
    } else if (e.key === "," && inputValue.trim()) {
      e.preventDefault();
      addValue(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addValue(inputValue);
    }
  };

  return (
    <div className={className}>
      {valueArray.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {valueArray.map((item, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="flex items-center gap-1 py-1 px-2"
            >
              {item}
              <X 
                size={14} 
                className="cursor-pointer hover:text-red-500 transition-colors"
                onClick={() => removeValue(index)} 
              />
            </Badge>
          ))}
        </div>
      )}
      <NeuInput
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default CommaSeparatedInput;
