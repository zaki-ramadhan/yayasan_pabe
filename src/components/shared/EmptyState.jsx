import { cn } from "@/lib/utils";

/**
 * Standardized EmptyState component for search, filters, and blank collections
 * @param {string} title
 * @param {string} [description]
 * @param {React.ReactNode} [action]
 * @param {"card" | "dashed" | "minimal"} [variant]
 * @param {string} [className]
 */
export function EmptyState({
  title,
  description,
  action,
  variant = "card",
  className = "",
}) {
  return (
    <div
      className={cn(
        "text-center p-6 sm:p-8 space-y-2.5 rounded-xl",
        variant === "card" && "py-14 sm:py-16 bg-white border border-slate-300 shadow-xs",
        variant === "dashed" && "py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50",
        variant === "minimal" && "py-10",
        className
      )}
    >
      <p className="text-base font-semibold text-slate-950">{title}</p>
      {description && (
        <p className="text-sm text-slate-700 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
