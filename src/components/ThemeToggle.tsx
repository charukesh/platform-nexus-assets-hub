
import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = React.useState(false);
  
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setIsChanging(true);
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => {
        setIsChanging(false);
      }, 600); // Match with the CSS duration
    }, 150);
  };

  return (
    <>
      {isChanging && (
        <div 
          className="fixed inset-0 bg-background z-50 transition-opacity duration-500"
          style={{ 
            opacity: isChanging ? 1 : 0,
            pointerEvents: isChanging ? 'all' : 'none'
          }}
        />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="neu-flat hover:neu-pressed transition-all duration-300">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
