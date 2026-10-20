import { DistributionSyariahRadarChart } from "./DistributionSyariahRadarChart";
import { DistributionSectionHeader } from "./DistributionSectionHeader";
import { DistributionActionLink } from "./DistributionActionLink";
import { DistributionStatGrid } from "./DistributionStatGrid";

/**
 * Organism component: Section 3 - SK Dewan Pengawas Syariah
 * Visual radar chart with header action and horizontal key metrics bar below.
 * @param {object} props
 * @param {object} props.syariahData
 */
export function DistributionSyariahSection({ syariahData }) {
  if (!syariahData) return null;

  const metrics = [
    {
      label: "Nomor Ketetapan SK",
      value: syariahData.skNumber,
      title: syariahData.skNumber,
    },
    {
      label: "Ketua Dewan Pengawas",
      value: syariahData.shariaBoardChairman,
      title: syariahData.shariaBoardChairman,
    },
    {
      label: "Masa Berlaku",
      value: syariahData.effectiveDate,
      title: syariahData.effectiveDate,
    },
    {
      label: "Status Kepatuhan",
      value: "Terverifikasi Penuh Fiqih",
      title: "Terverifikasi Penuh Sesuai Kaidah Fiqih ZISWAF",
    },
  ];

  return (
    <section className="space-y-4">
      <DistributionSectionHeader
        title={syariahData.title}
        description="Dasar legalitas dan penilaian kepatuhan seluruh aktivitas yayasan terhadap syariat Islam."
        action={
          <DistributionActionLink
            href={syariahData.pdfUrl}
            filename={syariahData.downloadFilename || "SK-Dewan-Pengawas-Syariah-PABE-2026.pdf"}
            documentTitle="SK Dewan Pengawas Syariah"
          />
        }
      />

      <div className="w-full">
        <DistributionSyariahRadarChart metrics={syariahData.radarMetrics} />
      </div>

      <DistributionStatGrid
        items={metrics}
        cols="grid-cols-2 sm:grid-cols-4 sm:gap-6"
      />
    </section>
  );
}
