import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-60 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-none",
        accent: "bg-accent text-white hover:bg-accent-hover shadow-none",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-none",
        outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-slate-800",
        link: "text-primary underline-offset-4 hover:underline",
        // 3D embossed variants — use className to override gradient colors
        primary3d:
          "text-white font-medium bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 border-t border-t-blue-400 border-x border-x-blue-600 border-b-2 border-b-blue-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_6px_rgba(29,78,216,0.25)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
        secondary3d:
          "text-slate-900 font-medium bg-gradient-to-b from-white via-slate-50 to-slate-100 hover:from-slate-50 hover:to-slate-200 border-t border-t-white border-x border-x-slate-200 border-b-2 border-b-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_6px_rgba(0,0,0,0.06)] active:translate-y-0.5 active:shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs sm:text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
