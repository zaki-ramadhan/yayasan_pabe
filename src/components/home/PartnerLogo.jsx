
/**
 * Atom: Satu pill logo mitra.
 * Menampilkan gambar logo jika tersedia, fallback ke teks jika `logo` null.
 */
export function PartnerLogo({ partner }) {
  const Wrapper = partner.url ? "a" : "div";
  const wrapperProps = partner.url
    ? { href: partner.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      title={`${partner.name} — ${partner.category}`}
      className="h-14 px-5 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0"
    >
      {partner.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${partner.logo}?v=2`}
          alt={partner.name}
          className="max-h-8 w-auto max-w-[80px] object-contain select-none pointer-events-none"
          loading="lazy"
        />
      ) : (
        <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap tracking-tight">
          {partner.name}
        </span>
      )}
    </Wrapper>
  );
}
