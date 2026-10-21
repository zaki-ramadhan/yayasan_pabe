"use client";

import Link from "next/link";
import { formatDate } from "@/lib/formatters";

export function DonorReportItem({ report }) {
  if (!report) return null;

  return (
    <div className="p-4 rounded-md border border-slate-200 bg-white transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate">
            {report.categoryName}
          </span>
          <span className="text-xs font-normal text-slate-400 shrink-0">
            {formatDate(report.date)}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-900 truncate">
          {report.title}
        </p>
        <p className="text-sm font-normal text-slate-600 line-clamp-2">
          {report.content}
        </p>
      </div>
      {report.campaignSlug && (
        <Link
          href={`/program/${report.campaignSlug}`}
          className="text-sm font-medium text-primary hover:underline whitespace-nowrap self-start sm:self-center shrink-0"
        >
          Lihat Berita
        </Link>
      )}
    </div>
  );
}
