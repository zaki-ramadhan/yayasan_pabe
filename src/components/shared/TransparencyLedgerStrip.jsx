import { Award } from "lucide-react";
import { formatRupiah, formatNumber, getCompactRupiahParts } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Open Ledger Strip displaying audited metrics and transparency numbers
 * Used on Homepage and Laporan Keuangan page.
 * @param {object} metrics
 * @param {"home" | "laporan"} [variant]
 * @param {string} [className]
 */
export function TransparencyLedgerStrip({
  metrics = {},
  variant = "home",
  className = "",
}) {
  const isLaporan = variant === "laporan";

  const compactDonations = getCompactRupiahParts(metrics.totalDonationsAllTime || 0, 1);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-300",
        isLaporan ? "py-4 sm:py-5" : "py-6 sm:py-7 border-slate-200",
        className
      )}
    >
      {isLaporan ? (
        <>
          {/* 1. Akuntabilitas Publik */}
          <div className="py-3 sm:py-0 sm:px-6 first:pl-0 space-y-1">
            <span className="text-sm font-medium text-slate-700 block">Akuntabilitas Publik</span>
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-800 tracking-tight flex items-center gap-1.5">
              <Award className="w-6 h-6 text-emerald-700 shrink-0" />
              Transparan
            </div>
            <span className="text-sm text-slate-600 block pt-0.5">Pencatatan Berkelanjutan</span>
          </div>

          {/* 2. Total Dana Dikelola */}
          <div className="py-3 sm:py-0 sm:px-6 space-y-1">
            <span className="text-sm font-medium text-slate-700 block">Total Dana Dikelola</span>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              {formatRupiah(metrics.totalDonationsAllTime || 0)}
            </div>
            <span className="text-sm text-slate-600 block pt-0.5">Akumulasi seluruh program</span>
          </div>

          {/* 3. Mustahik Binaan Rutin */}
          <div className="py-3 sm:py-0 sm:px-6 space-y-1">
            <span className="text-sm font-medium text-slate-700 block">Mustahik Binaan Rutin</span>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              {formatNumber(metrics.totalBeneficiaries || 0)}+ Jiwa
            </div>
            <span className="text-sm text-slate-600 block pt-0.5">Anak yatim &amp; dhuafa Cakung</span>
          </div>

          {/* 4. Titik Binaan */}
          <div className="py-3 sm:py-0 sm:px-6 last:pr-0 space-y-1">
            <span className="text-sm font-medium text-slate-700 block">Titik Binaan</span>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              {metrics.partnerPesantrenCount || 0} Lokasi
            </div>
            <span className="text-sm text-slate-600 block pt-0.5">Penerima distribusi rutin</span>
          </div>
        </>
      ) : (
        <>
          {/* Home Variant */}
          <div className="py-4 sm:py-0 sm:px-6 first:pl-0 space-y-1.5">
            <span className="text-sm sm:text-base font-medium text-slate-700 block">Total Dana Tersalurkan</span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight whitespace-nowrap">
              {compactDonations.prefix}
              {compactDonations.value.toLocaleString("id-ID", {
                minimumFractionDigits: compactDonations.decimals,
                maximumFractionDigits: compactDonations.decimals,
              })}{" "}
              {compactDonations.unit}
            </div>
            <span className="text-sm sm:text-base text-slate-700 block">Akumulasi seluruh program</span>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1.5">
            <span className="text-sm sm:text-base font-medium text-slate-700 block">Mustahik Binaan Rutin</span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight">
              {(metrics.totalBeneficiaries || 0).toLocaleString("id-ID")}+ Jiwa
            </div>
            <span className="text-sm sm:text-base text-slate-700 block">Anak yatim &amp; dhuafa Cakung</span>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1.5">
            <span className="text-sm sm:text-base font-medium text-slate-700 block">Titik Binaan</span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight">
              {(metrics.partnerPesantrenCount || 0).toLocaleString("id-ID")} Lokasi
            </div>
            <span className="text-sm sm:text-base text-slate-700 block">Tersebar di pelosok daerah</span>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 last:pr-0 space-y-1.5">
            <span className="text-sm sm:text-base font-medium text-slate-700 block">Standar Pengelolaan</span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 tracking-tight">
              Amanah &amp; Akuntabel
            </div>
            <span className="text-sm sm:text-base text-slate-700 block">Sesuai Syariah &amp; Regulasi</span>
          </div>
        </>
      )}
    </div>
  );
}
