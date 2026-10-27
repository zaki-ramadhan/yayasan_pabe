import { Check, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function VolunteerDashboardView() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Penugasan Aksi Lapangan</h2>
            <p className="text-xs text-slate-500">Misi sosial dan dakwah aktif yang ditugaskan kepada Anda.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Misi Aktif Minggu Ini
              </span>
              <h3 className="text-sm font-bold text-slate-950">
                Distribusi 500 Mushaf &amp; Paket Gizi Anak Binaan
              </h3>
              <p className="text-xs text-slate-600">Lokasi: Wilayah Binaan Cakung, 20 September 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => toast.success("Presensi kehadiran relawan berhasil dicatat!")}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Presensi Hadir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Buka form upload dokumentasi foto lapangan.")}
                className="h-9 text-xs border-slate-300 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 mr-1" /> Upload Foto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
