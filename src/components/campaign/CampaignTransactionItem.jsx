import { User } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function formatTimeOnly(dateInput) {
  if (!dateInput) return "Baru saja";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Baru saja";
  const wibTime = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const hours = String(wibTime.getHours()).padStart(2, "0");
  const minutes = String(wibTime.getMinutes()).padStart(2, "0");
  const seconds = String(wibTime.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds} WIB`;
}

/**
 * Individual donation transaction row item
 * @param {object} item - Transaction item details
 */
export function CampaignTransactionItem({ item }) {
  const isAnon = !item.name || item.name.toLowerCase().includes("hamba allah");
  const initial = isAnon ? "HA" : item.name.slice(0, 2).toUpperCase();

  return (
    <div className="p-2 flex items-center justify-between gap-2.5 shadow-2xs">
      {/* Left: Avatar & Donor Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shrink-0 overflow-hidden">
          {item.avatar && (
            <AvatarImage src={item.avatar} alt={item.name || "Donatur"} className="object-cover" />
          )}
          <AvatarFallback className="text-xs font-medium bg-slate-100 text-slate-700">
            {isAnon ? <User className="w-5 h-5 text-slate-500" /> : initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-medium text-slate-900 truncate block">
            {item.name || "Hamba Allah"}
          </span>
          <span className="text-xs text-slate-600 block mt-0.5 font-normal truncate">
            {maskEmail(item.email || (isAnon ? "hamba.allah***@gmail.com" : "donatur@pabe.id"))}
          </span>
        </div>
      </div>

      {/* Right: Donation Amount & Time Details */}
      <div className="text-right shrink-0">
        <span className="text-xs sm:text-sm font-medium text-slate-950 block">
          {formatRupiah(item.amount)}
        </span>
        <span className="text-xs text-slate-600 block mt-0.5 font-normal">
          {formatTimeOnly(item.date)}
        </span>
      </div>
    </div>
  );
}
