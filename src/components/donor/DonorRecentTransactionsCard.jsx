"use client";

import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/formatters";
import {
  DonorCard,
  DonorListItem,
  DonorListSkeleton,
  DonorEmptyText,
} from "@/components/donor/DonorDashboardPrimitives";

export function DonorRecentTransactionsCard({
  recentItems = [],
  isLoading = false,
}) {
  return (
    <DonorCard
      title="Transaksi Terakhir"
      actionText={recentItems.length > 0 ? "Lihat Semua" : undefined}
      actionHref="/donatur/riwayat"
    >
      <div className="space-y-2.5">
        {isLoading ? (
          <DonorListSkeleton count={4} height="h-12" />
        ) : recentItems.length === 0 ? (
          <DonorEmptyText message="Belum ada data" />
        ) : (
          recentItems.slice(0, 5).map((item) => (
            <DonorListItem key={item.id}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.programTitle}
                </p>
                <p className="text-xs font-normal text-slate-500">
                  {formatDate(item.date)}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-sm font-medium text-emerald-800 tabular-nums">
                  {formatRupiah(item.amount)}
                </p>
                <Link
                  href={`/invoice/${item.invoiceId}`}
                  target="_blank"
                  className="text-xs font-medium text-primary hover:underline block"
                >
                  Kuitansi
                </Link>
              </div>
            </DonorListItem>
          ))
        )}
      </div>
    </DonorCard>
  );
}
