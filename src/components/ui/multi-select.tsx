
import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOption = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {selected.length <= 2 ? (
                  selected.map((value) => (
                    <Badge
                      key={value}
                      variant="secondary"
                      className="mr-1"
                      onClick={(e) => removeOption(value, e)}
                    >
                      {options.find((option) => option.value === value)?.label || value}
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                  ))
                ) : (
                  <span>{selected.length} selected</span>
                )}
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <div className="flex items-center mr-2">
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        selected.includes(option.value)
                          ? "bg-primary border-primary"
                          : "opacity-50"
                      )}
                    >
                      {selected.includes(option.value) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    {option.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelect;
