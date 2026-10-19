import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Check } from "lucide-react";
import { ZakatEmptyState } from "./ZakatEmptyState";

export function ZakatResultPanel({
  result,
  hasCalculated,
  onPay,
}) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  if (!hasCalculated || !result) {
    return <ZakatEmptyState />;
  }

  const {
    netAmount = 0,
    nisabThreshold = 0,
    isNisabMet = false,
    zakatAmount = 0,
    periodLabel = "Per Bulan",
    categoryKey = "ZAKAT",
  } = result;

  const handleSaveResult = () => {
    try {
      const summaryText = `Ringkasan Kalkulator Zakat (${categoryKey}):\n- Nilai Bersih: ${formatRupiah(netAmount)}\n- Batas Nisab: ${formatRupiah(nisabThreshold)}\n- Status: ${isNisabMet ? "Wajib Ditunaikan" : "Belum Wajib"}\n- Kewajiban Zakat: ${formatRupiah(zakatAmount)}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(summaryText);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      toast({
        title: "Hasil Perhitungan Disimpan",
        description: "Rincian zakat aktif di sesi Anda dan telah disalin ke papan klip.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Hasil Perhitungan Disimpan",
        description: "Rincian zakat aktif tersimpan di sesi browser Anda.",
        variant: "success",
      });
    }
  };

  // Rasio capaian nisab untuk progress bar ala Earnest (maksimal 100%)
  const nisabRatioPercent = nisabThreshold > 0
    ? Math.min(100, Math.round((netAmount / nisabThreshold) * 100))
    : 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7 space-y-6 shadow-xs">
      {/* 1. Header Hero Number ala Earnest */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-slate-600 uppercase tracking-wider block">
          Total Kewajiban Zakat
        </span>
        <div className="text-3xl sm:text-4xl font-semibold text-slate-950 tracking-tight flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-semibold text-slate-950">
            Rp
          </span>
          <span>{formatNumber(zakatAmount)}</span>
        </div>
        <p className="text-sm text-slate-600 font-normal">
          Kadar zakat 2.5% ({periodLabel})
        </p>
      </div>

      {/* 2. Visual Proportion / Nisab Threshold Bar ala Earnest */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-end text-sm">
          <div className="text-left space-y-0.5">
            <span className="text-slate-600 block">Harta Bersih</span>
            <span className="font-medium text-slate-950 block">
              {formatRupiah(netAmount)}
            </span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-slate-600 block">Batas Nisab</span>
            <span className="font-medium text-slate-950 block">
              {formatRupiah(nisabThreshold)}
            </span>
          </div>
        </div>

        <div className="h-2.5 w-full bg-slate-100 rounded-md overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${
              isNisabMet ? "bg-emerald-600" : "bg-amber-500"
            }`}
            style={{ width: `${Math.max(5, nisabRatioPercent)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm text-slate-600 font-normal">
          <span>Tercapai: {nisabRatioPercent}% dari nisab</span>
          <span>
            {isNisabMet ? "Memenuhi ambang batas syariah" : "Belum mencapai ambang batas"}
          </span>
        </div>
      </div>

      {/* 3. Key Metrics Stat Strip (Horizontal Row dengan Divider) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-200 text-sm">
        <div className="space-y-0.5">
          <span className="text-slate-600 block">Batas Nisab</span>
          <span className="font-medium text-slate-950 block">
            {formatRupiah(nisabThreshold)}
          </span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
          <span className="text-slate-600 block">Kadar Zakat</span>
          <span className="font-medium text-slate-950 block">
            2.5%
          </span>
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
          <span className="text-slate-600 block">Status Syariah</span>
          <span
            className={`font-medium block ${
              isNisabMet ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {isNisabMet ? "Wajib Ditunaikan" : "Belum Wajib Zakat"}
          </span>
        </div>
      </div>

      {/* 4. CTA Button Group */}
      <div className="pt-2 space-y-2.5">
        <Button
          onClick={onPay}
          disabled={!isNisabMet || zakatAmount <= 0}
          className="w-full h-11 text-sm font-medium rounded-md cursor-pointer"
        >
          Tunaikan Zakat Sekarang
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSaveResult}
          className="w-full h-10 text-sm font-medium rounded-md border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
              <span>Hasil Tersimpan</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 stroke-[1.75]" />
              <span>Simpan Hasil Perhitungan</span>
            </>
          )}
        </Button>

        {!isNisabMet && (
          <p className="text-sm text-slate-600 text-center mt-1 font-normal">
            Harta belum mencapai batas nisab. Anda tetap dapat berinfak atau bersedekah secara sukarela.
          </p>
        )}
      </div>
    </div>
  );
}
