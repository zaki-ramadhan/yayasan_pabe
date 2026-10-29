import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ribbonBadgeVariants = cva(
  "inline-flex items-center font-medium tracking-normal select-none [clip-path:polygon(0%_0%,_100%_0%,_calc(100%-6px)_50%,_100%_100%,_0%_100%)] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white",
        primary: "bg-primary text-white",
        emerald: "bg-emerald-600 text-white",
        amber: "bg-amber-500 text-slate-950",
        rose: "bg-rose-600 text-white",
        slate: "bg-slate-800 text-white",
        dark: "bg-slate-900/70 backdrop-blur-xs text-white",
      },

      size: {
        xs: "text-[10px] leading-normal pl-1.5 pr-3 py-0.5",
        default: "text-[11px] leading-tight pl-2 pr-3.5 py-0.5",
        card: "text-xs sm:text-sm leading-tight pl-2.5 sm:pl-3 pr-4.5 sm:pr-5.5 py-1 sm:py-1.5",
        sm: "text-xs leading-none pl-2 pr-3 py-0.5",
        md: "text-xs sm:text-sm leading-normal pl-2.5 sm:pl-3 pr-4.5 sm:pr-5.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function RibbonBadge({ className, variant, size, children, ...props }) {
  return (
    <span
      className={cn(ribbonBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

export { RibbonBadge, ribbonBadgeVariants };
