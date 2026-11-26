import * as React from "react";
import { cn } from "@/lib/utils";
import { FormFieldContext } from "@/components/ui/FormField";

/**
 * Wrapper for zakat calculator fields with FormFieldContext error integration.
 */
export function ZakatFieldGroup({
  id,
  label,
  required = false,
  helperText,
  error,
  children,
  className,
}) {
  const isInvalid = Boolean(error);
  const contextValue = React.useMemo(
    () => ({ error, isInvalid, id }),
    [error, isInvalid, id]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium select-none transition-colors",
              isInvalid ? "text-rose-600" : "text-slate-700"
            )}
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div>{children}</div>
        {error && (
          <p className="text-xs sm:text-sm text-rose-600 font-medium leading-relaxed" role="alert">
            {error}
          </p>
        )}
        {helperText && (
          <p className="text-xs text-slate-500 leading-normal font-normal">
            {helperText}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}
