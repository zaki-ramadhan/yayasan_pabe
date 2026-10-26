import Image from "next/image";

/**
 * Atom: Satu item logo mitra tanpa pembungkus card / badge.
 * Menggunakan optical sizing agar proporsi logo 1:1/vertikal dan horizontal tetap seimbang.
 */
export function PartnerLogo({ partner }) {
  const Wrapper = partner.url ? "a" : "div";
  const wrapperProps = partner.url
    ? {
        href: partner.url,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${partner.name} (${partner.category})`,
      }
    : {};

  // Optical sizing classes per logo ID to ensure visually balanced weight
  const getLogoSizeClass = (id) => {
    switch (id) {
      case "baznas-dki":
        // Logo vertikal/tall: beri tinggi proporsional agar Garuda & teks terbaca jelas
        return "h-12 sm:h-14 w-auto max-w-[140px]";
      case "kemenkumham":
        // Logo persegi / 1:1: emblem resmi Pengayoman
        return "h-11 sm:h-12 w-auto max-w-[52px] rounded-lg shadow-2xs";
      case "kemensos-dinsos":
        // Logo horizontal memanjang (banner dua lambang + teks resmi)
        return "h-8 sm:h-9 w-auto max-w-[210px] sm:max-w-[240px]";
      default:
        return "h-8 sm:h-9 w-auto max-w-[120px]";
    }
  };

  return (
    <Wrapper
      {...wrapperProps}
      title={`${partner.name} — ${partner.category}`}
      className="relative flex items-center justify-center p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shrink-0"
    >
      {partner.logo ? (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={240}
          height={56}
          sizes="(max-width: 640px) 140px, 240px"
          style={{ width: "auto", height: "auto" }}
          className={`${getLogoSizeClass(partner.id)} object-contain select-none pointer-events-none`}
        />
      ) : (
        <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap tracking-tight">
          {partner.name}
        </span>
      )}
    </Wrapper>
  );
}
