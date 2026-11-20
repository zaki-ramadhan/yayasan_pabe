"use client";

import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";
import { getCampaignDetailHref } from "@/lib/zisFilter";

export function DonorReportItem({ report }) {
  if (!report) return null;

  return (
    <div className="p-4 rounded-md border border-slate-200 bg-white transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="truncate">
            {report.categoryName}
          </Badge>
          <span className="text-xs font-normal text-slate-500 shrink-0">
            {formatDate(report.date)}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-900 truncate">
          {report.title}
        </p>
        <p className="text-xs font-normal text-slate-500 line-clamp-2">
          {report.content}
        </p>
      </div>
      {report.campaignSlug && (
        <Link
          href={getCampaignDetailHref({
            slug: report.campaignSlug,
            categoryName: report.categoryName,
          })}
          className="text-sm font-medium text-primary hover:underline whitespace-nowrap self-start sm:self-center shrink-0"
        >
          Lihat Berita
        </Link>
      )}
    </div>
  );
}
