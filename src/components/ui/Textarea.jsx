"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormField } from "@/components/ui/FormField";

const Textarea = React.forwardRef(
  ({ className, error, isInvalid, ...props }, ref) => {
    const formContext = useFormField();
    const hasError =
      isInvalid !== undefined
        ? Boolean(isInvalid)
        : error !== undefined
        ? Boolean(error)
        : formContext?.isInvalid || false;

    return (
      <textarea
        aria-invalid={hasError ? "true" : undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500"
            : "border-slate-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-slate-950",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
