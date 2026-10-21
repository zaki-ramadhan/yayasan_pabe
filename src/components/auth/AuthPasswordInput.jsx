"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthPasswordInput({
  id = "password",
  label = "Kata sandi",
  placeholder = "masukkan kata sandi",
  value,
  onChange,
  onBlur,
  error,
  required = true,
  autoComplete = "current-password",
  extraAction,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
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
          autoComplete={autoComplete}
          className={cn(
            "h-11 pr-10 text-sm text-slate-900 border-slate-300 rounded-lg transition-colors",
            error && "border-rose-500 bg-rose-50/20 focus-visible:ring-rose-500"
          )}
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

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
