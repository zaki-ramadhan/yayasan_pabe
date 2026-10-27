import * as React from "react";
import { cn } from "@/lib/utils";
import { FormFieldContext } from "@/components/ui/form-field";

/**
 * Molecule: Wrapper standar input field kalkulator zakat dengan integrasi context error.
 */
export function ZakatFieldGroup({
  id,
  label,
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
          </label>
        )}
        <div>{children}</div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium leading-relaxed" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-slate-600 leading-normal font-normal">
            {helperText}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
