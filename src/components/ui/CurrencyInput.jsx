import * as React from "react";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function CurrencyInput({
  value,
  onChange,
  min = 0,
  max,
  maxDigits,
  placeholder = "0",
  className,
  autoFocus = false,
  id,
  name,
  disabled = false,
  ...props
}) {
  const effectiveMaxDigits = maxDigits ?? (max ? String(max).length : 11);
  const numericVal = typeof value === "number" ? value : parseInt(String(value || "").replace(/\D/g, ""), 10) || 0;
  const displayVal = numericVal > 0 ? formatNumber(numericVal) : "";

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    // Abaikan jika sudah melebihi batas panjang digit
    if (raw.length > effectiveMaxDigits) return;
    const parsed = raw ? parseInt(raw, 10) : 0;
    // Cegah input melebihi nilai maksimal yang ditentukan
    if (max !== undefined && max > 0 && parsed > max) return;
    const finalRaw = parsed > 0 ? String(parsed) : (raw === "" ? "" : "0");
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
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
    if (typeof props.onKeyDown === "function") {
      props.onKeyDown(e);
    }
  };

  return (
    <div className="relative w-full">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-normal text-slate-600 pointer-events-none select-none z-10">
        Rp
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={displayVal}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "w-full h-11 pl-10 pr-3 rounded-md border border-slate-300 text-sm font-normal text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}
