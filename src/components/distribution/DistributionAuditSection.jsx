"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
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
  const isMultiYear = auditData && typeof auditData === "object"
    ? Object.keys(auditData).some((k) => k.startsWith("Tahun "))
    : false;

  const availableYears = isMultiYear
    ? Object.keys(auditData).sort().reverse()
    : [`Tahun ${auditData?.year || 2025}`];

  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  if (!auditData || Object.keys(auditData).length === 0) return null;

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
          <div className="flex flex-wrap items-center gap-2">
            <DistributionYearFilter
              selectedYear={selectedYear}
              options={availableYears}
              onYearChange={setSelectedYear}
            />
            {currentAudit.pdfUrl && (
              <a
                href={currentAudit.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                title={`Unduh berkas PDF laporan pertanggungjawaban ${selectedYear}`}
              >
                <FileDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Unduh PDF</span>
              </a>
            )}
          </div>
        }
      />

      <DistributionAuditDonutChart allocations={currentAudit.allocations || []} />

      <DistributionStatGrid items={metrics} cols="grid-cols-2" />
    </section>
  );
}
