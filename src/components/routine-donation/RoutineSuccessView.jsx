import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatDateRange } from "@/lib/formatters";
import { getRoutineProgramAmount } from "@/lib/routineDonationConstants";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { formatRoutineSchedule } from "./RoutineProgramItem";

export function RoutineSuccessView({
  isAnonymous,
  fullName,
  email = "",
  selectedPrograms,
  campaigns = [],
  onReset,
}) {
  const router = useRouter();
  const campaignList = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="fixed inset-0 z-[60] bg-surface overflow-y-auto flex flex-col justify-between animate-in fade-in duration-300">
      {/* Header Brand Sederhana (Clean & Minimalist) */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 select-none focus:outline-none group"
          aria-label="Kembali ke Beranda Yayasan Payung Berkah"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
            <Image
              src={ASSET_PATHS.BRANDING.LOGO}
              alt="Logo Yayasan Payung Berkah"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight group-hover:text-primary transition-colors">
            Yayasan Payung Berkah
          </span>
        </Link>
      </header>

      {/* Konten Utama Sukses */}
      <main className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 text-center space-y-6 my-auto">
        {/* 3D Success Checkmark Badge */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50/80 border border-emerald-100/90 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-t border-t-emerald-300/80 border-x border-x-emerald-600 border-b-4 border-b-emerald-800 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(5,150,105,0.3)]">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Jadwal donasi rutin berhasil dibuat
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Terima kasih, <strong className="text-slate-900 font-semibold">{isAnonymous ? "Hamba Allah" : fullName}</strong>. Tautan pembayaran donasi akan kami kirim ke <strong className="text-slate-900 font-semibold">{email}</strong> saat jadwal tiba.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs text-left space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-950">
              Ringkasan komitmen donasi rutin
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Jadwal pengingat otomatis telah aktif
            </p>
          </div>

          <div className="space-y-3.5">
            {selectedPrograms.map((p) => {
              const camp =
                campaignList.find((c) => c.id === p.campaignId) || campaignList[0] || null;
              const nominal = getRoutineProgramAmount(p);
              const isReminderOnly = (p.routineType || "REMINDER_ONLY") === "REMINDER_ONLY";

              return (
                <div
                  key={p.id}
                  className="pb-3.5 border-b border-slate-100 last:border-0 last:pb-0 text-sm space-y-1"
                >
                  {/* Program Title */}
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-sm font-medium text-slate-950 line-clamp-2 leading-snug">
                      {camp.title}
                    </span>
                  </div>

                  {/* Parameter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    {/* Chip 1: Jadwal */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{formatRoutineSchedule(p)} • {p.reminderTime || "05:00"} WIB</span>
                    </span>

                    {/* Chip 2: Model Pelaksanaan + Nominal */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      {isReminderOnly ? (
                        <span>Pengingat Email</span>
                      ) : (
                        <span>Donasi Otomatis ({formatRupiah(nominal)})</span>
                      )}
                    </span>

                    {/* Chip 3 (Opsional): Periode Kustom */}
                    {p.hasCustomPeriod && p.startDate && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {formatDateRange(p.startDate, p.endDate)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={() => router.push("/")}
            variant="primary3d"
            className="h-11 px-8 text-sm rounded-lg"
          >
            Kembali ke beranda
          </Button>
        </div>
      </main>

      {/* Micro-Footer Sederhana */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-5 text-center text-xs text-slate-500">
        <p>© 2026 Yayasan Payung Berkah • Amanah &amp; Transparan</p>
      </footer>
    </div>
  );
}
