import { formatRupiah } from "@/lib/formatters";
import { DONATION_LIMITS } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { RibbonBadge } from "@/components/ui/ribbon-badge";
import { SummaryRow } from "@/components/donation/SummaryRow";

export function DonationCheckoutSummary({
  campaign,
  amount,
  selectedChannel,
  adminFee,
  totalPayment,
  isSubmitting,
}) {
  return (
    <div className="lg:col-span-5 lg:sticky lg:top-24">
      {/* Unified Summary & Program Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl space-y-4 shadow-xs border border-slate-300">
        {/* Campaign Info Section */}
        {campaign && (
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <span className="text-xs sm:text-sm text-slate-600 block font-normal">
              Anda akan berdonasi dalam program:
            </span>
            <div className="flex gap-3.5 items-center">
              {campaign.bannerUrl && (
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                  <SafeImage
                    src={campaign.bannerUrl}
                    alt={campaign.title}
                    sizes="72px"
                    fallbackText="Program PABE"
                  />
                </div>
              )}
              <div className="space-y-1 min-w-0 flex-1">
                {campaign.categoryName && (
                  <RibbonBadge variant="default" size="default">
                    {campaign.categoryName}
                  </RibbonBadge>
                )}
                <h3 className="text-sm sm:text-base font-semibold text-slate-950 line-clamp-2 leading-snug">
                  {campaign.title}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Payment Breakdown Section */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-semibold text-slate-950">Ringkasan Pembayaran</h3>
            <p className="text-sm text-slate-600">Pastikan rincian donasi Anda telah sesuai</p>
          </div>

          <div className="space-y-2.5 text-sm">
            <SummaryRow label="Nominal Donasi" value={formatRupiah(amount)} />
            <SummaryRow label="Metode Pembayaran" value={selectedChannel.name} />
            <SummaryRow
              label="Biaya Layanan"
              value={adminFee === 0 ? "Gratis" : formatRupiah(adminFee)}
            />
            <div className="flex justify-between items-baseline text-sm font-medium text-slate-600 pt-2.5 border-t border-slate-200">
              <span>Total Pembayaran</span>
              <span className="text-primary text-base sm:text-lg font-semibold tracking-tight">
                {formatRupiah(totalPayment)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="space-y-2.5 pt-0.5">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !amount || amount <= 0 || amount < DONATION_LIMITS.MIN_AMOUNT}
            variant="primary3d"
            className="w-full h-12 rounded-lg text-base disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting
              ? "Memproses Transaksi..."
              : amount >= DONATION_LIMITS.MIN_AMOUNT
              ? `Lanjut Pembayaran (${formatRupiah(totalPayment)})`
              : "Lanjut Pembayaran"}
          </Button>
        </div>
      </div>
    </div>
  );
}
