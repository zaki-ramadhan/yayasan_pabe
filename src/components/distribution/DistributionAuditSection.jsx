"use client";

import { useState } from "react";
import { FileDownloadIcon as FileDown } from "@solar-icons/react/line-duotone/file-download";
import { LoaderIcon } from "@solar-icons/react/linear/loader";
import { DistributionAuditDonutChart } from "./DistributionAuditDonutChart";
import { DistributionSectionHeader } from "./DistributionSectionHeader";
import { DistributionYearFilter } from "./DistributionYearFilter";
import { DistributionStatGrid } from "./DistributionStatGrid";
import { formatRupiah } from "@/lib/formatters";
import { downloadDocument } from "@/lib/documentDownloader";

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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!auditData || Object.keys(auditData).length === 0) return null;

  const currentAudit = isMultiYear
    ? auditData[selectedYear] || auditData[availableYears[0]] || {}
    : auditData;

  const handleDownload = async () => {
    if (!currentAudit.pdfUrl || isDownloading) return;
    const yearDigits = selectedYear.replace(/\D/g, "") || "2025";
    await downloadDocument({
      url: currentAudit.pdfUrl,
      fallbackFileName: `Laporan-Pertanggungjawaban-Keuangan-PABE-${yearDigits}.pdf`,
      onStart: () => setIsDownloading(true),
      onFinish: () => setIsDownloading(false),
    });
  };

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
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-md border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 shadow-2xs transition-colors hover:bg-slate-50 hover:text-emerald-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title={`Unduh berkas PDF laporan pertanggungjawaban ${selectedYear}`}
              >
                {isDownloading ? (
                  <LoaderIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-emerald-600 shrink-0" />
                ) : (
                  <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                )}
                <span>{isDownloading ? "Mengunduh..." : "Unduh PDF"}</span>
              </button>
            )}
          </div>
        }
      />

      <DistributionAuditDonutChart allocations={currentAudit.allocations || []} />

      <DistributionStatGrid items={metrics} cols="grid-cols-2" />
    </section>
  );
}
