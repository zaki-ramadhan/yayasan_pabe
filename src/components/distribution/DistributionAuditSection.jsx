"use client";

import { useState } from "react";
import { DistributionAuditDonutChart } from "./DistributionAuditDonutChart";
import { DistributionSectionHeader } from "./DistributionSectionHeader";
import { DistributionYearFilter } from "./DistributionYearFilter";
import { DistributionStatGrid } from "./DistributionStatGrid";
import { formatRupiah } from "@/lib/formatters";

/**
 * Organism component: Section 1 - Laporan Pertanggungjawaban Tahunan
 * Menampilkan donut chart alokasi dana dan metrik keuangan dengan filter tahun buku.
 * @param {object} props
 * @param {Record<string, object>|object} props.auditData
 */
export function DistributionAuditSection({ auditData = {} }) {
  if (!auditData || Object.keys(auditData).length === 0) return null;

  // Cek apakah auditData berbentuk multi-tahun (dictionary bertipe { "Tahun 2025": {...} })
  const isMultiYear = Object.keys(auditData).some((k) => k.startsWith("Tahun "));
  const availableYears = isMultiYear
    ? Object.keys(auditData).sort().reverse()
    : [`Tahun ${auditData.year || 2025}`];

  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const currentAudit = isMultiYear
    ? auditData[selectedYear] || auditData[availableYears[0]] || {}
    : auditData;

  const title = currentAudit.title || `Laporan Pertanggungjawaban (${selectedYear})`;

  const metrics = [
    { label: "Status Laporan", value: "Publik & Terbuka" },
    {
      label: "Legalitas Lembaga",
      value: "SK Kemenkumham RI",
      title: "Terdaftar Resmi di Kementerian Hukum dan HAM RI",
    },
    {
      label: "Rasio Hak Amil",
      value: `${currentAudit.operationalRatio || "8.4%"} (Maks. ${currentAudit.maxAllowedRatio || "12.5%"})`,
    },
    {
      label: "Dana Terkelola",
      value: formatRupiah(currentAudit.totalFundsManaged || 0),
    },
  ];

  return (
    <section className="space-y-4">
      <DistributionSectionHeader
        title={title}
        description={currentAudit.description || "Laporan pertanggungjawaban pengelolaan dana donasi, infak, dan sedekah yang transparan dan akuntabel."}
        action={
          <DistributionYearFilter
            selectedYear={selectedYear}
            options={availableYears}
            onYearChange={setSelectedYear}
          />
        }
      />

      <DistributionAuditDonutChart allocations={currentAudit.allocations || []} />

      <DistributionStatGrid items={metrics} cols="grid-cols-2" />
    </section>
  );
}
