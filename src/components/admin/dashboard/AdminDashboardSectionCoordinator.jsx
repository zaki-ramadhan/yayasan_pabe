"use client";

import { useState } from "react";
import { AdminRecentTransactionsCard } from "@/components/admin/AdminRecentTransactionsCard";
import { AdminCampaignOverviewCard } from "@/components/admin/AdminCampaignOverviewCard";
import { AdminRoutineMiniCard } from "@/components/admin/dashboard/AdminRoutineMiniCard";
import { LayoutGrid, CheckCircle2 } from "lucide-react";

export function AdminDashboardSectionCoordinator({
  transactions = [],
  campaigns = [],
}) {
  const [layoutOption, setLayoutOption] = useState("balanced");

  const options = [
    {
      id: "balanced",
      badge: "Rekomendasi",
      title: "1. Seimbang 5 Item",
      desc: "5 baris transaksi & 5 program. Tinggi sejajar 1:1 simetris.",
    },
    {
      id: "fit",
      badge: "Natural",
      title: "2. Fit-Content",
      desc: "7 transaksi. Card kanan tinggi auto tanpa ruang kosong tengah.",
    },
    {
      id: "stacked",
      badge: "Informasi+",
      title: "3. Widget Tambahan",
      desc: "7 transaksi. Bawah kanan diisi kartu Donasi Rutin.",
    },
    {
      id: "scroll",
      badge: "Compact",
      title: "4. Scroll Internal",
      desc: "Tabel kiri diberi batas tinggi & scroll vertikal.",
    },
  ];

  return (
    <div className="space-y-2.5">
      {/* Interactive Layout Switcher Bar for User Testing */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block leading-tight">
                Uji Coba 4 Opsi Tata Letak
              </span>
              <span className="text-[11px] text-slate-500 block">
                Klik opsi di bawah untuk melihat live perubahannya:
              </span>
            </div>
          </div>

          {/* Option Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
            {options.map((opt) => {
              const isActive = layoutOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayoutOption(opt.id)}
                  className={`text-left sm:text-center px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 justify-between sm:justify-center ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{opt.title}</span>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Option Explanation */}
        <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
          <span>
            <strong>Penjelasan:</strong> {options.find((o) => o.id === layoutOption)?.desc}
          </span>
          <span className="hidden md:inline text-slate-400">
            (Pilih opsi yang paling Anda sukai untuk kami kunci secara permanen)
          </span>
        </div>
      </div>

      {/* RENDER LAYOUT BERDASARKAN OPSI YANG DIPILIH */}
      {layoutOption === "balanced" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
            <AdminRecentTransactionsCard
              initialTransactions={transactions}
              maxRows={5}
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
            <AdminCampaignOverviewCard
              campaigns={campaigns}
              maxItems={5}
              stretch={true}
            />
          </div>
        </div>
      )}

      {layoutOption === "fit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
            <AdminRecentTransactionsCard
              initialTransactions={transactions}
              maxRows={7}
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
            <AdminCampaignOverviewCard
              campaigns={campaigns}
              maxItems={4}
              stretch={false}
            />
          </div>
        </div>
      )}

      {layoutOption === "stacked" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
            <AdminRecentTransactionsCard
              initialTransactions={transactions}
              maxRows={7}
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-2.5">
            <AdminCampaignOverviewCard
              campaigns={campaigns}
              maxItems={3}
              stretch={false}
            />
            <AdminRoutineMiniCard />
          </div>
        </div>
      )}

      {layoutOption === "scroll" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
            <AdminRecentTransactionsCard
              initialTransactions={transactions}
              maxRows={7}
              scrollable={true}
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
            <AdminCampaignOverviewCard
              campaigns={campaigns}
              maxItems={4}
              stretch={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
