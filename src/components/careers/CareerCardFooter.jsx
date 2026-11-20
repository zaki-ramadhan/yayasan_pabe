import { cn } from "@/lib/utils";

/**
 * Atomic component: Bottom footer row for vacancy card
 * Displays quota, applicant count and post date with dashed separator.
 * @param {object} props
 * @param {number} [props.applicantCount=0]
 * @param {string} props.postedAt
 * @param {number} [props.quota=1]
 * @param {string} [props.className]
 */
export function CareerCardFooter({
  applicantCount = 0,
  postedAt,
  quota = 1,
  className = "",
}) {
  const displayQuota = typeof quota === "number" && quota >= 1 ? quota : 1;

  return (
    <div
      className={cn(
        "border-t border-dashed border-slate-200 mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-600 font-medium",
        className
      )}
    >
      <span className="text-slate-700 font-medium">
        Kuota {displayQuota} orang
      </span>
      <span>
        {applicantCount > 0 ? `${applicantCount} pelamar` : "Belum ada pelamar"}
      </span>
    </div>
  );
}
