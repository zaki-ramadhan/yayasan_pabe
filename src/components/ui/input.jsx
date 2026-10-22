"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      isLoading = false,
      onClear,
      value,
      icon: Icon,
      leftIcon,
      ...props
    },
    ref
  ) => {
    const ResolvedIcon = Icon || leftIcon;
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const renderLeftIcon = () => {
      if (!ResolvedIcon) return null;
      if (React.isValidElement(ResolvedIcon)) return ResolvedIcon;
      const IconComponent = ResolvedIcon;
      return <IconComponent className="w-4 h-4 text-slate-500" />;
    };

    return (
      <div className="relative w-full flex items-center">
        {ResolvedIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center shrink-0">
            {renderLeftIcon()}
          </div>
        )}

        <input
          type={type}
          value={value}
          suppressHydrationWarning
          className={cn(
            "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-500 placeholder:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            ResolvedIcon && "pl-9",
            (isLoading || (onClear && hasValue)) && "pr-9",
            className
          )}
          ref={ref}
          {...props}
        />

        {/* Right Loading Spinner or Clear X Button */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {!isLoading && onClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Hapus input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
