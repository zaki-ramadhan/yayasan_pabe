import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";

/**
 * Top hero header for Distribusi page delegating to InformationHeroHeader
 */
export function DistributionHeader({
  title = "Distribusi Program & Bantuan",
  description = "Transparansi audit keuangan independen, dinamika rekam jejak penyaluran bantuan berkala, serta kepatuhan fatwa Dewan Pengawas Syariah demi menjaga amanah umat secara profesional dan akuntabel.",
  badge = (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Transparansi Penyaluran
    </span>
  ),
  className = "",
}) {
  return (
    <InformationHeroHeader
      title={title}
      description={description}
      badge={badge}
      className={className}
      imageAlt="Latar Belakang Distribusi Penyaluran Yayasan PABE"
    />
  );
}
