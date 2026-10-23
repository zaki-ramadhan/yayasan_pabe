import Link from "next/link";
import { ArrowRight, Repeat, CalendarCheck, Wallet } from "lucide-react";

export function AdminRoutineMiniCard() {
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">
              Komitmen Donasi Rutin
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Pemberi donasi terjadwal aktif
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-3.5 sm:p-4 grid grid-cols-2 gap-2.5">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Donatur Rutin</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">
            42 Donatur
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimasi / Bln</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">
            Rp 14,5 Juta
          </div>
        </div>
      </div>

      {/* Link Action */}
      <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-0">
        <Link
          href="/admin/donasi-rutin"
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors"
        >
          <span>Kelola Jadwal Donasi Rutin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
