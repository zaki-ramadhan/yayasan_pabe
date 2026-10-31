import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";

/**
 * Top hero header for Distribusi page delegating to InformationHeroHeader
 */
export function DistributionHeader({
  title = "Distribusi Program & Bantuan",
  description = "Transparansi audit keuangan independen serta dinamika rekam jejak penyaluran bantuan berkala demi menjaga amanah para donatur secara profesional dan akuntabel.",
  badge = null,
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
