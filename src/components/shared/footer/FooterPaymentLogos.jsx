
const DEFAULT_PAYMENT_LOGOS = [
  { name: "QRIS", src: "/img/payments/qris.png", alt: "QRIS Nasional" },
  { name: "Bank Mandiri", src: "/img/payments/mandiri.png", alt: "Bank Mandiri" },
  { name: "Bank BNI", src: "/img/payments/BNI.png", alt: "Bank BNI" },
  { name: "Bank BRI", src: "/img/payments/BRI.png", alt: "Bank BRI" },
  { name: "Bank Permata", src: "/img/payments/permata.png", alt: "Bank Permata" },
  { name: "GoPay", src: "/img/payments/gopay.png", alt: "GoPay" },
  { name: "ShopeePay", src: "/img/payments/shopeepay.png", alt: "ShopeePay" },
  { name: "Kredivo", src: "/img/payments/kredivo.png", alt: "Kredivo" },
  { name: "Akulaku", src: "/img/payments/akulaku.png", alt: "Akulaku" },
  { name: "Indomaret", src: "/img/payments/indomaret.png", alt: "Indomaret" },
  { name: "Alfamart", src: "/img/payments/alfamart.png", alt: "Alfamart" },
  { name: "Alfamidi", src: "/img/payments/alfamidi.png", alt: "Alfamidi" },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${m.src}?v=2`}
              alt={m.alt}
              className="max-h-5 sm:max-h-6 w-auto max-w-full object-contain select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
