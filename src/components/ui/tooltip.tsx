
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced tooltip with arrow and custom styling capabilities
const EnhancedTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { 
    hasArrow?: boolean;
    variant?: "default" | "info" | "success" | "warning";
  }
>(({ className, sideOffset = 4, hasArrow = false, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-popover text-popover-foreground",
    info: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800",
    success: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800",
    warning: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800"
  };

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {props.children}
      {hasArrow && (
        <TooltipPrimitive.Arrow 
          className={cn(
            "fill-current",
            variant === "default" ? "fill-border" : `fill-${variant}-200 dark:fill-${variant}-800`
          )} 
        />
      )}
    </TooltipPrimitive.Content>
  );
});
EnhancedTooltipContent.displayName = "EnhancedTooltipContent";

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  EnhancedTooltipContent 
}
