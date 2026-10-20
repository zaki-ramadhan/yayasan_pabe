import { cn } from "@/lib/utils";

/**
 * Standardized Page Header component for catalog & public pages
 * @param {string} title
 * @param {string} [description]
 * @param {React.ReactNode} [badge]
 * @param {React.ReactNode} [action]
 * @param {"left" | "center"} [align]
 * @param {string} [className]
 */
export function PageHeader({
  title,
  description,
  badge,
  action,
  align = "left",
  className = "",
  titleClassName = "",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-2",
        isCenter ? "text-center max-w-2xl mx-auto" : "max-w-3xl",
        className
      )}
    >
      {badge && <div className={cn("mb-2", isCenter && "flex justify-center")}>{badge}</div>}
      <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4")}>
        <div className="space-y-2">
          <h1
            className={cn(
              "text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight leading-tight",
              titleClassName
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-base text-slate-700 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pt-2 sm:pt-0">{action}</div>}
      </div>
    </div>
  );
}
