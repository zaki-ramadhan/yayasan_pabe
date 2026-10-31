"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle, CircleX, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-3 overflow-hidden rounded-xl border p-4 shadow-xl will-change-transform",
  {
    variants: {
      variant: {
        default:
          "border-slate-700/80 bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-950/20",
        info:
          "border-blue-500/80 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/15",
        success:
          "border-emerald-500/80 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/15",
        destructive:
          "border-rose-500/80 bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/15",
        error:
          "border-rose-500/80 bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/15",
        warning:
          "border-amber-500/80 bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-950/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, open = true, onOpenChange, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-state={open ? "open" : "closed"}
      className={cn(
        toastVariants({ variant }),
        open ? "toast-enter" : "toast-exit",
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick(e);
    }}
    className={cn(
      "absolute right-2.5 top-2.5 z-20 inline-flex items-center justify-center rounded-lg p-1 text-white/80 transition-all hover:text-white hover:bg-white/20 active:scale-90 cursor-pointer pointer-events-auto focus:outline-none",
      className
    )}
    aria-label="Tutup notifikasi"
    {...props}
  >
    <X className="h-4 w-4 text-white shrink-0" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-normal text-white leading-snug", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-normal text-white/90 leading-snug mt-0.5", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

function ToastIcon({ variant }) {
  if (variant === "success") {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />;
  }
  if (variant === "destructive" || variant === "error") {
    return <CircleX className="h-5 w-5 shrink-0 text-white" />;
  }
  if (variant === "warning") {
    return <AlertTriangle className="h-5 w-5 shrink-0 text-white" />;
  }
  return <Info className="h-5 w-5 shrink-0 text-white" />;
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      tabIndex={-1}
      aria-live="polite"
      className="fixed top-4 inset-x-0 mx-auto z-[100] flex max-h-screen w-full max-w-[420px] flex-col items-center pointer-events-none gap-2 px-4 sm:px-0"
    >
      {toasts.map(function ({ id, title, description, action, variant, open, onOpenChange, ...props }) {
        return (
          <Toast
            key={id}
            variant={variant}
            open={open}
            className="pointer-events-auto"
            {...props}
          >
            <div className="flex items-start gap-3 w-full pr-7">
              <ToastIcon variant={variant} />
              <div className="grid gap-0.5 text-left flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        );
      })}
    </div>
  );
}

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
