"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function AuthPasswordInput({
  id = "password",
  label = "Kata sandi",
  placeholder = "Masukkan kata sandi",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = true,
  autoComplete = "current-password",
  extraAction,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {extraAction}
      </div>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={Boolean(error)}
          autoComplete={autoComplete}
          className={cn("h-11 pr-10 text-sm font-normal", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-rose-600 font-medium mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-slate-500 font-normal mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
