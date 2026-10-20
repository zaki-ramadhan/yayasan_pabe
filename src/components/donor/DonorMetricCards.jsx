"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DonorStatCard, DonorAmountDisplay } from "@/components/donor/DonorDashboardPrimitives";

export function DonorMetricCards({ metrics, lastDonation, isLoading = false }) {
  const totalNominal = metrics?.totalNominal || 0;
  const totalTransactions = metrics?.totalTransactions || 0;
  const totalPrograms = metrics?.totalPrograms || 0;
  const lastAmount = lastDonation ? Number(lastDonation.amount || 0) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-3 rounded-md border border-slate-200/90 bg-sidebar p-5 animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-36" />
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-md border border-slate-200/90 bg-sidebar p-5 animate-pulse space-y-2.5"
          >
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-8 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
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
      value: `${totalTransactions.toLocaleString("id-ID")} Kali`,
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
      <div className="sm:col-span-3 rounded-md border border-slate-200/90 bg-sidebar pt-3.5 sm:pt-4 px-3 sm:px-3.5 pb-2.5 sm:pb-3 space-y-2.5">
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
      </div>

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
