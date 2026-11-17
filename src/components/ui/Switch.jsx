"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Accessible Toggle Switch primitive.
 * Adheres to WAI-ARIA switch pattern with keyboard navigation support.
 */
export const Switch = React.forwardRef(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      size = "default",
      className,
      "aria-label": ariaLabel,
      id,
      ...props
    },
    ref
  ) => {
    const isSm = size === "sm";

    const handleToggle = (e) => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    const handleKeyDown = (e) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onCheckedChange?.(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none",
          isSm ? "h-5 w-9 p-0.5" : "h-6 w-11 p-0.5",
          checked ? "bg-primary" : "bg-slate-300 hover:bg-slate-400/80",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out",
            isSm ? "h-4 w-4" : "h-5 w-5",
            checked
              ? isSm
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

