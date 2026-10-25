import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters";
import { RoutineSummaryItem } from "./RoutineSummaryItem";

export function RoutineSummaryCard({
  selectedPrograms = [],
  totalPerCommitment = 0,
  isSubmitting = false,
  campaigns = [],
  onStartTour,
}) {
  const campaignList = Array.isArray(campaigns) ? campaigns : [];

  const hasAnyAutoDonation = selectedPrograms.some(
    (p) => (p.routineType || "REMINDER_ONLY") === "AUTO_DONATION"
  );

  return (
    <div id="tour-summary-card" className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-5 shadow-xs">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-950">
          Ringkasan Jadwal Donasi
        </h3>
        <p className="text-sm text-slate-600 mt-0.5">
          {selectedPrograms.length} program terdaftar
        </p>
      </div>

      {/* Program Breakdown List */}
      <div className="space-y-3.5">
        {selectedPrograms.map((p, idx) => {
          const camp =
            campaignList.find((c) => c.id === p.campaignId) || campaignList[0] || null;
          return (
            <RoutineSummaryItem
              key={p.id}
              program={p}
              index={idx}
              campaign={camp}
            />
          );
        })}
      </div>

      {/* Total Commitment Calculation (Hanya tampil jika ada program donasi otomatis) */}
      {hasAnyAutoDonation && (
        <div className="pt-3 border-t border-slate-200 space-y-1">
          <div className="flex justify-between items-baseline text-base font-medium text-slate-950">
            <span>Total per Jadwal</span>
            <span className="text-primary text-xl sm:text-2xl font-bold tracking-tight">
              {formatRupiah(totalPerCommitment)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 italic font-normal">
            *Nominal disesuaikan otomatis dengan jadwal donasi pilihan
          </p>
        </div>
      )}

      {/* Primary 3D CTA Submit Button + Icon-only Tour Button */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={
            isSubmitting ||
            selectedPrograms.length === 0 ||
            (hasAnyAutoDonation && totalPerCommitment <= 0)
          }
          variant="primary3d"
          className="flex-1 h-12 rounded-lg text-base disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting
            ? "Menyimpan Jadwal..."
            : totalPerCommitment > 0
            ? `Aktifkan Jadwal (${formatRupiah(totalPerCommitment)})`
            : "Aktifkan Pengingat Donasi Rutin"}
        </Button>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            aria-label="Panduan donasi rutin"
            title="Panduan donasi rutin"
            className="inline-flex items-center justify-center h-12 w-12 shrink-0 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
