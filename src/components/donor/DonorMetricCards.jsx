"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DonorStatCard, DonorAmountDisplay } from "@/components/donor/DonorDashboardPrimitives";

export function DonorMetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <Card className="sm:col-span-3 border-slate-200/90 bg-sidebar pt-3.5 sm:pt-4 px-3 sm:px-3.5 pb-2.5 sm:pb-3 space-y-2.5 shadow-2xs">
        <div className="space-y-1.5 pb-2.5">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-8 w-52 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="border-slate-200/90 bg-sidebar p-4 sm:p-5 space-y-2 shadow-2xs"
        >
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-7 w-32 rounded" />
        </Card>
      ))}
    </div>
  );
}

export function DonorMetricCards({ metrics, lastDonation, isLoading = false }) {
  const totalNominal = metrics?.totalNominal || 0;
  const totalTransactions = metrics?.totalTransactions || 0;
  const totalPrograms = metrics?.totalPrograms || 0;
  const lastAmount = lastDonation ? Number(lastDonation.amount || 0) : 0;

  if (isLoading) {
    return <DonorMetricCardsSkeleton />;
  }

  const QUICK_ACTIONS = [
    { label: "Donasi Baru", href: "/program" },
    { label: "Bayar Zakat", href: "/kalkulator-zakat" },
    { label: "Donasi Rutin", href: "/donasi-rutin" },
    { label: "Rekap Kuitansi", href: "/donatur/riwayat" },
  ];

  const STAT_CARDS = [
    {
      title: "Frekuensi Donasi",
      value: `${totalTransactions.toLocaleString("id-ID")}x`,
    },
    {
      title: "Program Didukung",
      value: `${totalPrograms.toLocaleString("id-ID")} Program`,
    },
    {
      title: "Donasi Terakhir",
      amount: lastAmount,
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {/* Card 1: Total Donasi Tersalurkan */}
      <Card className="sm:col-span-3 border-slate-200/90 bg-sidebar pt-3.5 sm:pt-4 px-3 sm:px-3.5 pb-2.5 sm:pb-3 space-y-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-2.5 border-slate-200/80">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Donasi Tersalurkan
            </p>
            <DonorAmountDisplay
              amount={totalNominal}
              prefixClassName="text-sm sm:text-base font-medium text-slate-950"
              valueClassName="text-2xl sm:text-3xl font-medium text-slate-950"
            />
          </div>

          {totalTransactions > 0 && (
            <Link
              href="/donatur/riwayat"
              className="text-sm font-medium text-primary hover:underline self-start"
            >
              Lihat Seluruh Riwayat
            </Link>
          )}
        </div>

        {/* 4 Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-10 px-3 rounded-md border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-900 text-sm font-medium cursor-pointer"
              >
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* Cards 2, 3, 4 via mapped DonorStatCard */}
      {STAT_CARDS.map((card) => (
        <DonorStatCard
          key={card.title}
          title={card.title}
          value={card.value}
          amount={card.amount}
          isCurrency={card.isCurrency}
        />
      ))}
    </div>
  );
}
