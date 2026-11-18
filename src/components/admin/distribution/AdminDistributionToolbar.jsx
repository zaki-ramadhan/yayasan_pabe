"use client";

import { useState } from "react";
import { TableToolbar } from "@/components/ui/Table";
import { FileDownloadIcon as FileDown } from "@solar-icons/react/line-duotone/file-download";
import { LoaderIcon } from "@solar-icons/react/linear/loader";
import { downloadDocument } from "@/lib/documentDownloader";

export function AdminDistributionToolbar({
  search,
  onSearchChange,
  onClearSearch,
  isLoading,
  onRefresh,
  onOpenAdd,
}) {
  const currentYear = new Date().getFullYear();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (isDownloading) return;
    await downloadDocument({
      url: `/api/documents/download?type=audit&year=${currentYear}`,
      fallbackFileName: `Rekap-Laporan-Pertanggungjawaban-${currentYear}.pdf`,
      onStart: () => setIsDownloading(true),
      onFinish: () => setIsDownloading(false),
    });
  };

  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari program atau kegiatan penyaluran..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      onRefresh={onRefresh}
      isLoading={isLoading}
      extraActions={
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          title={`Unduh Laporan Pertanggungjawaban Resmi Tahun ${currentYear} (PDF)`}
        >
          {isDownloading ? (
            <LoaderIcon className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
          ) : (
            <FileDown className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{isDownloading ? "Mengunduh..." : `Rekap Laporan (${currentYear})`}</span>
        </button>
      }
      primaryAction={{
        label: "Penyaluran baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
