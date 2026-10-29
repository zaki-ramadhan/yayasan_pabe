import { useRouter } from "next/navigation";
import { CheckCircle2, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/formatters";
import { getRoutineProgramAmount } from "@/lib/routineDonationConstants";
import { formatRoutineSchedule } from "./RoutineProgramItem";

export function RoutineSuccessView({
  isAnonymous,
  fullName,
  whatsapp,
  selectedPrograms,
  campaigns = [],
  onReset,
}) {
  const router = useRouter();
  const campaignList = Array.isArray(campaigns) ? campaigns : [];

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
          Jadwal Donasi Rutin Berhasil Dibuat
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          Jazakumullah Khairan {isAnonymous ? "Hamba Allah" : fullName}. Pengingat dan tautan akad donasi akan dikirimkan otomatis ke WhatsApp <strong className="text-slate-900 font-semibold">{whatsapp}</strong> sesuai jadwal pilihan Anda.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs text-left space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-950">
            Ringkasan Komitmen Donasi Rutin
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Jadwal pengingat otomatis telah aktif
          </p>
        </div>

        <div className="space-y-3.5">
          {selectedPrograms.map((p, idx) => {
            const camp =
              campaignList.find((c) => c.id === p.campaignId) || campaignList[0] || null;
            const nominal = getRoutineProgramAmount(p);
            const isReminderOnly = (p.routineType || "REMINDER_ONLY") === "REMINDER_ONLY";

            return (
              <div
                key={p.id}
                className="pb-3.5 border-b border-slate-100 last:border-0 last:pb-0 text-sm space-y-1"
              >
                {/* Program Title - Selaras dengan text-base font-medium text-slate-950 */}
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-base font-medium text-slate-950 shrink-0 select-none">
                    {idx + 1}.
                  </span>
                  <span className="text-base font-medium text-slate-950 line-clamp-2 leading-snug">
                    {camp.title}
                  </span>
                </div>

                {/* Parameter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 pl-6">
                  {/* Chip 1: Jadwal */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{formatRoutineSchedule(p)} • {p.reminderTime || "05:00"} WIB</span>
                  </span>

                  {/* Chip 2: Model Pelaksanaan + Nominal */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    {isReminderOnly ? (
                      <span>Pengingat WA Saja</span>
                    ) : (
                      <span>Donasi Otomatis ({formatRupiah(nominal)})</span>
                    )}
                  </span>

                  {/* Chip 3 (Opsional): Periode Kustom */}
                  {p.hasCustomPeriod && p.startDate && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {p.startDate} s/d {p.endDate || "Seterusnya"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          onClick={() => router.push("/")}
          variant="primary3d"
          className="h-11 px-6 text-sm rounded-lg"
        >
          Kembali ke Beranda
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="h-11 px-6 border-slate-300 text-slate-800 hover:bg-slate-50 font-medium rounded-lg cursor-pointer"
        >
          Atur Jadwal Lain
        </Button>
      </div>
    </main>
  );
}
