import { cn } from "@/lib/utils";

/**
 * Universal Section Header for page sections
 * Supports centered, left-aligned, and split layouts (title left, action right).
 *
 * @param {object} props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.badge]
 * @param {React.ReactNode} [props.action]
 * @param {"center" | "left" | "split"} [props.align]
 * @param {"default" | "lg"} [props.size]
 * @param {string} [props.className]
 */
export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  align = "center",
  size = "default",
  className = "",
}) {
  const isSplit = align === "split";
  const isCenter = align === "center";
  const isLarge = size === "lg";

  const titleClasses = cn(
    "font-medium text-slate-950 tracking-tight leading-tight text-2xl sm:text-3xl lg:text-4xl"
  );

  const subtitleClasses = "text-base text-slate-700 leading-relaxed font-normal";

  if (isSplit) {
    return (
      <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", className)}>
        <div className="space-y-2 max-w-2xl">
          {badge && <div className="mb-1">{badge}</div>}
          <h2 className={titleClasses}>{title}</h2>
          {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-1.5",
        isCenter ? "text-center max-w-2xl mx-auto" : "max-w-2xl",
        className
      )}
    >
      {badge && <div className={cn("mb-1", isCenter && "flex justify-center")}>{badge}</div>}
      <h2 className={titleClasses}>{title}</h2>
      {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
      {action && <div className={cn("pt-2", isCenter && "flex justify-center")}>{action}</div>}
    </div>
  );
}
