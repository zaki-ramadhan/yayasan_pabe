import { DistributionAuditDonutChart } from "./DistributionAuditDonutChart";
import { DistributionSectionHeader } from "./DistributionSectionHeader";
import { DistributionActionLink } from "./DistributionActionLink";
import { DistributionStatGrid } from "./DistributionStatGrid";
import { formatRupiah } from "@/lib/formatters";

/**
 * Organism component: Section 1 - Laporan Keuangan Audit
 * Displays audit title, concise description, PDF download link, donut chart, and key metrics.
 * @param {object} props
 * @param {object} props.auditData
 */
export function DistributionAuditSection({ auditData }) {
  if (!auditData) return null;

  const metrics = [
    { label: "Opini Audit", value: auditData.opinion },
    {
      label: "Kantor Akuntan Publik",
      value: auditData.auditorName,
      title: auditData.auditorName,
    },
    {
      label: "Rasio Hak Amil",
      value: `${auditData.operationalRatio} (Maks. ${auditData.maxAllowedRatio})`,
    },
    {
      label: "Dana Terkelola",
      value: formatRupiah(auditData.totalFundsManaged),
    },
  ];

  return (
    <section className="space-y-4">
      <DistributionSectionHeader
        title={auditData.title}
        description="Hasil audit kepatuhan keuangan tahunan oleh akuntan publik independen dengan opini WTP."
        action={
          <DistributionActionLink
            href={auditData.pdfUrl}
            filename={auditData.downloadFilename || "Laporan-Audit-Keuangan-PABE-2025.pdf"}
            documentTitle="Laporan Keuangan Audit"
          />
        }
      />

      <DistributionAuditDonutChart allocations={auditData.allocations} />

      <DistributionStatGrid items={metrics} cols="grid-cols-2" />
    </section>
  );
}
