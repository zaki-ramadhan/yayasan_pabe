"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * Mendapatkan warna bar progres berdasarkan persentase pencapaian
 * - < 25%   : Amber (Tahap awal penghimpunan)
 * - 25%-74% : Biru Utama / Primary (Progres aktif berjalan)
 * - 75%-99% : Teal (Mendekati target)
 * - >= 100% : Emerald (Target tercapai / surplus)
 */
export function getProgressColor(value = 0) {
  const num = Number(value) || 0;
  if (num >= 100) return "bg-emerald-600";
  if (num >= 75) return "bg-teal-600";
  if (num >= 25) return "bg-primary";
  return "bg-amber-500";
}

export function getProgressTextColor(value = 0) {
  const num = Number(value) || 0;
  if (num >= 100) return "text-emerald-700";
  if (num >= 75) return "text-teal-700";
  if (num >= 25) return "text-primary";
  return "text-amber-700";
}

const Progress = React.forwardRef(({ className, value = 0, variant, indicatorClassName, ...props }, ref) => {
  const barColor =
    variant === "accent"
      ? "bg-accent"
      : variant === "warning"
      ? "bg-warning"
      : variant === "primary"
      ? "bg-primary"
      : variant === "emerald"
      ? "bg-emerald-600"
      : getProgressColor(value);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-md bg-slate-200",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-500", barColor, indicatorClassName)}
        style={{ transform: `translateX(-${Math.max(0, 100 - (Number(value) || 0))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

