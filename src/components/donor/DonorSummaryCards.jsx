"use client";

import { formatRupiah } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export function DonorSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-2.5"
        >
          <Skeleton className="h-4 w-32 rounded-sm" />
          <Skeleton className="h-8 w-44 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function DonorSummaryCards({ metrics, isLoading = false }) {
  const cards = [
    {
      title: "Total Nominal Donasi",
      amount: metrics?.totalNominal || 0,
      isCurrency: true,
    },
    {
      title: "Frekuensi Donasi",
      value: `${(metrics?.totalTransactions || 0).toLocaleString("id-ID")} Kali`,
    },
    {
      title: "Program Didukung",
      value: `${(metrics?.totalPrograms || 0).toLocaleString("id-ID")} Program`,
    },
  ];

  if (isLoading) {
    return <DonorSummaryCardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-md border border-slate-200/90 bg-sidebar p-5 transition-colors"
        >
          <p className="text-sm font-medium text-slate-500">
            {card.title}
          </p>
          {card.isCurrency ? (
            <p className="mt-1 tracking-tight text-slate-950 flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-medium text-slate-950">Rp</span>
              <span className="text-2xl font-medium text-slate-950">
                {Number(card.amount || 0).toLocaleString("id-ID")}
              </span>
            </p>
          ) : (
            <p className="text-2xl font-medium text-slate-950 mt-1 tracking-tight">
              {card.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
