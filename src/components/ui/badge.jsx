import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium truncate whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-light text-primary border-primary/20",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        success: "border-transparent bg-accent-light text-emerald-700 border-accent/20",
        urgent: "border-transparent bg-warning-light text-amber-800 border-warning/20",
        danger: "border-transparent bg-red-50 text-red-700 border-red-200",
        outline: "border-border-strong text-slate-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export { RibbonBadge, ribbonBadgeVariants } from "./ribbon-badge";
