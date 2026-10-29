import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * Metric card component for admin, volunteer, and donor dashboards
 * @param {string} label - Top small metric label
 * @param {React.ReactNode} value - Main emphasized numeric value or title
 * @param {React.ReactNode} [subtitle] - Bottom contextual status or note
 * @param {"slate" | "emerald" | "primary"} [statusColor] - Status text color variant
 * @param {string} [className] - Optional custom classes
 */
export function DashboardMetricCard({
  label,
  value,
  subtitle,
  statusColor = "slate",
  className = "",
}) {
  const statusColors = {
    slate: "text-slate-500",
    emerald: "text-emerald-600 font-medium",
    primary: "text-primary font-medium",
  };

  return (
    <Card className={cn("p-5 bg-white border-slate-200 shadow-2xs space-y-1", className)}>
      <span className="text-xs text-slate-500 block mb-1">{label}</span>
      <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
        {value}
      </div>
      {subtitle && (
        <span className={cn("text-xs block mt-1", statusColors[statusColor] || statusColors.slate)}>
          {subtitle}
        </span>
      )}
    </Card>
  );
}
