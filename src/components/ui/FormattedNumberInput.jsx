import * as React from "react";
import { formatThousandsInput, parseThousandsToNumber } from "@/lib/formatters";
import { useFormField } from "@/components/ui/FormField";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { cn } from "@/lib/utils";

/**
 * Standardized thousand-separated number input without browser spin controls.
 */
export function FormattedNumberInput({
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  maxDigits,
  placeholder = "0",
  className,
  autoFocus = false,
  id,
  name,
  disabled = false,
  error,
  isInvalid,
  ...props
}) {
  const formContext = useFormField();
  const hasError =
    isInvalid !== undefined
      ? Boolean(isInvalid)
      : error !== undefined
      ? Boolean(error)
      : formContext?.isInvalid || false;

  const effectiveMaxDigits = maxDigits ?? (max ? String(max).length : 15);
  const numericVal = parseThousandsToNumber(value);
  const displayVal = numericVal > 0 ? formatThousandsInput(numericVal) : "";

  const handleChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (rawDigits.length > effectiveMaxDigits) return;
    const parsed = parseThousandsToNumber(rawDigits);
    if (max !== undefined && max > 0 && parsed > max) return;
    const finalRaw = parsed > 0 ? String(parsed) : rawDigits === "" ? "" : "0";
    onChange(parsed, finalRaw);
  };

  const handleBlur = (e) => {
    if (min > 0 && String(value || "").trim() !== "" && numericVal < min) {
      onChange(min, String(min));
    } else if (max !== undefined && max > 0 && numericVal > max) {
      onChange(max, String(max));
    }
    if (typeof props.onBlur === "function") {
      props.onBlur(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === " ") {
      e.preventDefault();
    }
    if (typeof props.onKeyDown === "function") {
      props.onKeyDown(e);
    }
  };

  return (
    <div className="relative w-full">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-normal text-slate-600 pointer-events-none select-none z-10">
          {prefix}
        </span>
      )}
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={displayVal}
        minLength={FIELD_LIMITS.CURRENCY_INPUT.min}
        maxLength={FIELD_LIMITS.CURRENCY_INPUT.max}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={hasError ? "true" : undefined}
        className={cn(
          "w-full h-11 rounded-lg border text-sm font-normal text-slate-950 placeholder:text-slate-400 focus:outline-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed bg-white border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary",
          prefix ? "pl-10" : "pl-3.5",
          suffix ? "pr-14" : "pr-3.5",
          hasError && "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500",
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-normal text-slate-500 pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
