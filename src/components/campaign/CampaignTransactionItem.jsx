import { formatRupiah } from "@/lib/formatters";
import { formatClockTime } from "@/lib/dateUtils";
import { maskEmail } from "@/lib/security";
import { UserAvatar } from "@/components/ui/Avatar";

/**
 * Individual donation transaction row item
 * @param {object} item - Transaction item details
 */
export function CampaignTransactionItem({ item }) {
  const isAnon = !item.name || item.name.toLowerCase().includes("hamba allah");

  return (
    <div className="p-2 flex items-center justify-between gap-2.5 shadow-2xs">
      {/* Left: Avatar & Donor Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <UserAvatar
          src={item.avatar}
          name={item.name}
          fallback="D"
          isAnonymous={isAnon}
        />
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-medium text-slate-900 truncate block">
            {item.name || "Hamba Allah"}
          </span>
          <span className="text-xs text-slate-600 block mt-0.5 font-normal truncate">
            {maskEmail(item.email || (isAnon ? "hamba.allah***@gmail.com" : "donatur@pabe.id"))}
          </span>
        </div>
      </div>

      {/* Right: Donation Amount & Time */}
      <div className="text-right shrink-0">
        <span className="text-xs sm:text-sm font-medium text-slate-950 block">
          {formatRupiah(item.amount)}
        </span>
        <span className="text-xs text-slate-600 block mt-0.5 font-normal tabular-nums">
          {formatClockTime(item.date, { withSeconds: true })}
        </span>
      </div>
    </div>
  );
}
