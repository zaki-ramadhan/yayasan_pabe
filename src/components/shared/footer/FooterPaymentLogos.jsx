
import Image from "next/image";
import { ASSET_PATHS } from "@/lib/assetConstants";

const DEFAULT_PAYMENT_LOGOS = [
  { name: "QRIS", src: ASSET_PATHS.PAYMENTS.QRIS, alt: "QRIS Nasional" },
  { name: "Bank BCA", src: ASSET_PATHS.PAYMENTS.BCA, alt: "Bank BCA" },
  { name: "Bank Mandiri", src: ASSET_PATHS.PAYMENTS.MANDIRI, alt: "Bank Mandiri" },
  { name: "Bank BNI", src: ASSET_PATHS.PAYMENTS.BNI, alt: "Bank BNI" },
  { name: "Bank BRI", src: ASSET_PATHS.PAYMENTS.BRI, alt: "Bank BRI" },
  { name: "Bank Permata", src: ASSET_PATHS.PAYMENTS.PERMATA, alt: "Bank Permata" },
  { name: "GoPay", src: ASSET_PATHS.PAYMENTS.GOPAY, alt: "GoPay" },
  { name: "ShopeePay", src: ASSET_PATHS.PAYMENTS.SHOPEEPAY, alt: "ShopeePay" },
  { name: "Indomaret", src: ASSET_PATHS.PAYMENTS.INDOMARET, alt: "Indomaret" },
  { name: "Alfamart", src: ASSET_PATHS.PAYMENTS.ALFAMART, alt: "Alfamart" },
];

/**
 * Payment method partners logo list for footer
 *
 * @param {object} props
 * @param {Array} [props.logos] - Array of payment logo items
 */
export function FooterPaymentLogos({ logos = DEFAULT_PAYMENT_LOGOS }) {
  if (!logos || logos.length === 0) return null;

  return (
    <div className="space-y-3">
      <h5 className="inline-block text-sm font-semibold uppercase tracking-wider text-white">
        Pilihan saluran donasi:
      </h5>
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {logos.map((m) => (
          <div
            key={m.name} aria-label={m.name}
            className="w-[72px] sm:w-[80px] h-9 sm:h-10 rounded-md bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0 p-2"
          >
            <Image
              src={m.src}
              alt={m.alt}
              width={72}
              height={24}
              className="max-h-5 sm:max-h-6 w-auto max-w-full object-contain select-none pointer-events-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
