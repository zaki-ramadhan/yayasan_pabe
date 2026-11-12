import Link from "next/link";
import { Check, X } from "lucide-react";
import { getCampaignDonateHref } from "@/lib/zisFilter";

/**
 * Komponen status terminal pembayaran (PAID, EXPIRED, CANCELLED)
 *
 * @param {object} props
 * @param {object} props.donation
 */
export function InvoicePaymentStatusBanner({ donation }) {
  if (donation.status === "PAID") {
    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Success Checkmark Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50/80 border border-emerald-100/90 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-t border-t-emerald-300/80 border-x border-x-emerald-600 border-b-4 border-b-emerald-800 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(5,150,105,0.3)]">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Pembayaran Berhasil Terverifikasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Alhamdulillah, amanah donasi Anda telah kami terima secara resmi melalui sistem perbankan.
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Saluran: <span className="font-medium text-slate-700">{donation.paymentChannelName}</span>
        </p>
      </div>
    );
  }

  if (donation.status === "EXPIRED") {
    const renewHref = donation.campaignSlug
      ? `${getCampaignDonateHref(donation.campaignSlug)}?amount=${donation.amount}`
      : "/program";

    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Expired Cross Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50/80 border border-rose-100/90 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 border-t border-t-rose-300/80 border-x border-x-rose-600 border-b-4 border-b-rose-900 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(225,29,72,0.3)]">
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Batas Waktu Pembayaran Telah Habis
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Tagihan donasi ini telah kedaluwarsa demi keamanan transaksi. Saluran pembayaran otomatis dinonaktifkan. Anda dapat membuat tagihan baru kapan pun Anda siap.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={renewHref}
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            Donasi lagi
          </Link>
        </div>
      </div>
    );
  }

  if (donation.status === "CANCELLED") {
    const renewHref = donation.campaignSlug
      ? `${getCampaignDonateHref(donation.campaignSlug)}?amount=${donation.amount}`
      : "/program";

    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Cancelled Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 border-t border-t-slate-400 border-x border-x-slate-600 border-b-4 border-b-slate-900 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(71,85,105,0.3)]">
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Tagihan Donasi Dibatalkan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Tagihan donasi ini telah dibatalkan. Anda dapat membuat donasi baru kapan saja.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={renewHref}
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            Donasi lagi
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

