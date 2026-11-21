import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { CheckCircleFill, AlertCircleFill } from "@/components/icons/StatusIcons";
import { ZakatEmptyState } from "./ZakatEmptyState";

function InvoiceItem({ label, value, children, className = "" }) {
  return (
    <div className={`flex justify-between items-center gap-3 ${className}`}>
      <span className="text-slate-600 shrink-0">{label} :</span>
      {children || <span className="font-medium text-slate-950 text-right">{value}</span>}
    </div>
  );
}

export function ZakatResultPanel({
  result,
  hasCalculated,
  onPay,
}) {
  const [isSaved, setIsSaved] = useState(false);

  if (!hasCalculated || !result) {
    return <ZakatEmptyState />;
  }

  const {
    netAmount = 0,
    nisabThreshold = 0,
    isNisabMet = false,
    zakatAmount = 0,
    periodLabel = "Saat Menerima",
    categoryKey = "ZAKAT",
  } = result;

  const kadarText =
    categoryKey === "ZAKAT_PERTANIAN"
      ? result.breakdown?.find((b) => b.label === "Kadar Zakat")?.value || "10% / 5%"
      : "2,5%";

  const buildZakatShareText = () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/kalkulator-zakat`
      : "https://payungberkah.com/kalkulator-zakat";
    return `*Kalkulator Zakat - Yayasan Payung Berkah*\n\n` +
      `• Kategori: ${categoryKey}\n` +
      `• Nilai Harta Bersih: ${formatRupiah(netAmount)}\n` +
      `• Batas Nishab: ${formatRupiah(nisabThreshold)}\n` +
      `• Kadar Zakat: ${kadarText}\n` +
      `• Waktu Penunaian: ${periodLabel}\n` +
      `• Status Syariah: ${isNisabMet ? "Wajib Ditunaikan" : "Belum Wajib Zakat"}\n` +
      `• Estimasi Zakat: ${formatRupiah(zakatAmount)}\n\n` +
      `Hitung dan tunaikan zakat Anda dengan mudah melalui kalkulator resmi:\n${url}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(buildZakatShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleSaveResult = async () => {
    const summaryText = buildZakatShareText();
    const copied = await copyToClipboard(summaryText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);

    if (copied) {
      toast.success("Rincian Disalin", {
        description: "Rincian perhitungan zakat telah disalin ke papan klip.",
      });
    } else {
      toast.info("Rincian Zakat Aktif", {
        description: "Rincian zakat aktif tersimpan di sesi browser Anda.",
      });
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7 space-y-6 shadow-xs">
      <div className="space-y-1.5 pb-4 border-b border-slate-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Total kewajiban zakat
        </h2>
        <div className="text-3xl sm:text-4xl font-semibold text-slate-950 tracking-tight flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-normal text-slate-700">
            Rp
          </span>
          <span>{formatNumber(zakatAmount)}</span>
        </div>
        <p className="text-xs text-slate-500">
          Kadar {kadarText} ({periodLabel})
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <InvoiceItem label="Harta terhitung" value={formatRupiah(netAmount)} />
        <InvoiceItem label="Batas nishab" value={formatRupiah(nisabThreshold)} />
        <InvoiceItem label="Kadar zakat" value={kadarText} />
        <InvoiceItem label="Waktu penunaian" value={periodLabel} />
        <InvoiceItem
          label="Status syariah"
          className="pt-3 border-t border-dashed border-slate-200"
        >
          <span
            className={`inline-flex items-center gap-1.5 font-medium text-right ${
              isNisabMet ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {isNisabMet ? (
              <CheckCircleFill className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircleFill className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span>{isNisabMet ? "Wajib Ditunaikan" : "Belum Wajib Zakat"}</span>
          </span>
        </InvoiceItem>
      </div>

      <div className="pt-2 space-y-2.5">
        <Button
          onClick={onPay}
          disabled={!isNisabMet || zakatAmount <= 0}
          className="w-full h-11 text-sm font-medium rounded-md cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          Tunaikan zakat sekarang
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleShareWhatsApp}
            className="flex-1 h-10 text-xs sm:text-sm font-medium rounded-md border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            Bagikan ke WhatsApp
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleSaveResult}
            className="h-10 px-4 text-xs sm:text-sm font-medium rounded-md border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer shrink-0"
          >
            {isSaved ? "Tersalin" : "Salin rincian"}
          </Button>
        </div>

        {!isNisabMet && (
          <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
            Harta belum mencapai batas nishab. Anda tetap dapat menunaikan infak atau sedekah secara sukarela.
          </p>
        )}
      </div>
    </div>
  );
}
