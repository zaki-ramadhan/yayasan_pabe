import { cn } from "@/lib/utils";

/**
 * Atomic component: Bottom footer row for vacancy card
 * Displays applicant count and post date with dashed separator.
 * @param {object} props
 * @param {number} [props.applicantCount=0]
 * @param {string} props.postedAt
 * @param {string} [props.className]
 */
export function CareerCardFooter({
  applicantCount = 0,
  postedAt,
  className = "",
}) {
  return (
    <div
      className={cn(
        "border-t border-dashed border-slate-200 mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-600 font-medium",
        className
      )}
    >
      <span>
        {applicantCount > 0 ? `${applicantCount} pelamar` : "Belum ada pelamar"}
      </span>
      {postedAt && <span>Diposting {postedAt}</span>}
    </div>
  );
}
