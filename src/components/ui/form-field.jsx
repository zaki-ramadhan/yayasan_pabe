import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Komponen FormField terstandarisasi untuk membungkus label, input, aksi samping, dan pesan validasi/keterangan.
 * Single Source of Truth untuk layout form di Admin, Donor, dan Public.
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  action,
  className = "",
  labelClassName = "",
  children,
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className={cn(
              "text-sm font-medium text-slate-800 block select-none",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          {action && <div className="text-xs shrink-0">{action}</div>}
        </div>
      )}

      {children}

      {error && (
        <p className="text-xs text-rose-500 leading-tight mt-1">{error}</p>
      )}

      {!error && hint && (
        <p className="text-xs text-slate-500 leading-tight mt-1">{hint}</p>
      )}
    </div>
  );
}
