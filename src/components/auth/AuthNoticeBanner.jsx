import { InfoCircleIcon as Info } from "@solar-icons/react/line-duotone/info-circle";
import { cn } from "@/lib/utils";

/**
 * Notice banner used in authentication forms (e.g. donation gate notice)
 * @param {string} title
 * @param {string} description
 * @param {React.ComponentType} [icon]
 * @param {"amber" | "blue" | "slate"} [variant]
 * @param {string} [className]
 */
export function AuthNoticeBanner({
  title,
  description,
  icon: Icon = Info,
  variant = "amber",
  className = "",
}) {
  const styles = {
    amber: "bg-amber-50 border-amber-300 text-amber-950",
    blue: "bg-blue-50 border-blue-200 text-blue-950",
    slate: "bg-slate-50 border-slate-200 text-slate-900",
  };

  const iconStyles = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    slate: "text-slate-500",
  };

  return (
    <div
      className={cn(
        "p-3.5 rounded-lg border text-sm flex items-start gap-2.5 shadow-xs",
        styles[variant] || styles.amber,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", iconStyles[variant] || iconStyles.amber)} />
      <div className="space-y-0.5">
        <p className="font-semibold">{title}</p>
        <p className="text-xs opacity-90 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
