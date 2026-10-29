import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS } from "@/services/authService";

export function DashboardHeader({ currentUser, userRole }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-primary-light text-primary">
            {ROLE_LABELS[userRole] || userRole}
          </span>
          <span className="text-xs text-slate-500">Terakhir login: Hari ini, 16:45 WIB</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
          Ahlan wa Sahlan, {currentUser?.name || "Pengguna"}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {currentUser?.title || "Kelola aktivitas dan layanan amanah umat secara transparan."}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href="/program">
          <Button size="sm" variant="outline" className="h-9 text-xs border-slate-300">
            Lihat Program Publik
          </Button>
        </Link>
        <Link href="/donasi-rutin">
          <Button size="sm" className="h-9 text-xs bg-primary hover:bg-primary-hover text-white">
            <CalendarHeart className="w-3.5 h-3.5 mr-1" /> Donasi Rutin
          </Button>
        </Link>
      </div>
    </div>
  );
}
