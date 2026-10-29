import { cn } from "@/lib/utils";

/**
 * Atom component: Single key metric item
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {string} [props.title]
 * @param {string} [props.subtext]
 * @param {string} [props.className]
 */
export function DistributionStatItem({
  label,
  value,
  title,
  subtext,
  className,
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <span className="text-slate-600 block">{label}</span>
      <span
        className="font-medium text-slate-950 block truncate"
      >
        {value}
      </span>
      {subtext && (
        <span className="text-slate-500 block text-sm">{subtext}</span>
      )}
    </div>
  );
}

/**
 * Molecule component: Horizontal key metrics grid below charts
 *
 * @param {object} props
 * @param {Array<{ label: string, value: React.ReactNode, title?: string, subtext?: string }>} props.items
 * @param {string} [props.cols="grid-cols-2"]
 * @param {string} [props.className]
 */
export function DistributionStatGrid({
  items = [],
  cols = "grid-cols-2",
  className,
}) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        "pt-3 border-t border-slate-100 grid gap-3 sm:gap-4 text-sm",
        cols,
        className
      )}
    >
      {items.map((item, index) => (
        <DistributionStatItem
          key={item.label || index}
          label={item.label}
          value={item.value}
          subtext={item.subtext}
        />
      ))}
    </div>
  );
}
