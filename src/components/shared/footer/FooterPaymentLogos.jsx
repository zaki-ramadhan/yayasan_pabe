
const DEFAULT_PAYMENT_LOGOS = [
  { name: "QRIS", src: "/img/branding/payments/qris.webp", alt: "QRIS Nasional" },
  { name: "Bank BRI", src: "/img/branding/payments/bri.webp", alt: "Bank BRI" },
  { name: "Bank Mandiri", src: "/img/branding/payments/mandiri.webp", alt: "Bank Mandiri" },
  { name: "GoPay", src: "/img/branding/payments/gopay.webp", alt: "GoPay" },
  { name: "ShopeePay", src: "/img/branding/payments/shopeepay.webp", alt: "ShopeePay" },
  { name: "Indomaret", src: "/img/branding/payments/indomaret.webp", alt: "Indomaret" },
  { name: "Alfamart", src: "/img/branding/payments/alfamart.webp", alt: "Alfamart" },
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
        Tersedia metode pembayaran:
      </h5>
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {logos.map((m) => (
          <div
            key={m.name}
            title={m.name}
            className="w-[72px] sm:w-[80px] h-9 sm:h-10 rounded-md bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0 p-2"
          >
            <img
              src={m.src}
              alt={m.alt}
              loading="lazy"
              decoding="async"
              className="max-h-5 sm:max-h-6 w-auto max-w-full object-contain select-none pointer-events-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
