import { cn } from "@/lib/utils";

/**
 * Molecule component: Sub-section header for distribution report sections
 * Displays title, concise description, and optional right-aligned action.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
export function DistributionSectionHeader({
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-baseline justify-between gap-2",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm font-normal text-slate-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 pt-1 sm:pt-0">{action}</div>}
    </div>
  );
}
