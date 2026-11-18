import { cn } from "@/lib/utils";

/**
 * Atomic Section Header for Report Dashboard.
 * Consistent vertical accent line + heading.
 *
 * @param {object} props
 * @param {string} props.title - Heading title text
 * @param {string} [props.className] - Optional container class
 */
export function ReportSectionHeader({ title, className = "" }) {
  return (
    <div className={className}>
      <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
}
