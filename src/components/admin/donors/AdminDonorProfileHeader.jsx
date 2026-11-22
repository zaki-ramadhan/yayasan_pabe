import { UserAvatar } from "@/components/ui/Avatar";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";

export function AdminDonorProfileHeader({ donor }) {
  if (!donor) return null;

  return (
    <div className="pb-4 border-b border-slate-100">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <UserAvatar
          src={donor.avatar}
          name={donor.name}
          fallback="D"
          isAnonymous={donor.name === "Hamba Allah"}
          className="w-11 h-11 bg-slate-100"
          fallbackClassName="text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-medium text-slate-900 leading-tight truncate">
              {donor.name}
            </h4>
          </div>
          <p className="text-sm text-slate-500 font-normal mt-0.5">
            Donasi pertama: {donor.firstDonatedAt ? formatDate(donor.firstDonatedAt) : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
        <div>
          <span className="text-xs text-slate-500 font-normal block">Email</span>
          <span className="text-sm text-slate-800 font-medium truncate block mt-0.5">
            {donor.email ? maskEmail(donor.email) : "-"}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 font-normal block">No. Telepon</span>
          <span className="text-sm text-slate-800 font-medium tabular-nums truncate block mt-0.5">
            {donor.phone ? maskPhone(donor.phone) : "-"}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 font-normal block">Total Donasi</span>
          <span className="text-sm text-slate-900 font-medium tabular-nums block mt-0.5">
            {formatRupiah(donor.totalPaidAmount)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 font-normal block">Frekuensi</span>
          <span className="text-sm text-slate-900 font-medium block mt-0.5">
            {donor.paidCount}x
          </span>
        </div>
      </div>
    </div>
  );
}

