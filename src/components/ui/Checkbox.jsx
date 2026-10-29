"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      onChange,
      id,
      label,
      description,
      disabled = false,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isChecked = Boolean(checked);

    const handleChange = (e) => {
      if (disabled) return;
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const checkboxIndicator = (
      <div
        className={cn(
          "w-4.5 h-4.5 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer",
          isChecked
            ? "bg-primary border-primary text-white"
            : "bg-white border-slate-300 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed bg-slate-100"
        )}
      >
        {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </div>
    );

    if (variant === "card") {
      return (
        <label
          htmlFor={id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none",
            isChecked
              ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
              : "bg-white border-slate-200/90 hover:bg-slate-50/70 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div className="mt-0.5">{checkboxIndicator}</div>
          <div className="min-w-0 flex-1">
            {label && (
              <span className="text-sm font-medium text-slate-900 block leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-slate-500 block mt-0.5">
                {description}
              </span>
            )}
          </div>
        </label>
      );
    }

    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        {checkboxIndicator}
        {label && <span className="text-sm font-normal text-slate-800">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
