import { Skeleton } from "@/components/ui/Skeleton";
import { DonorMetricCardsSkeleton } from "@/components/donor/DonorMetricCards";
import {
  DonorListSkeleton,
  DonorReportListSkeleton,
} from "@/components/donor/DonorDashboardPrimitives";

export function DonorDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* Heading Utama */}
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* KOLOM KIRI & TENGAH (8 KANVAS: METRIK + GRAFIK + LAPORAN) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* 1. Baris Kartu Metrik Utama & Quick Actions */}
          <DonorMetricCardsSkeleton />

          {/* 2. Grafik Riwayat Donasi Bulanan */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-44 rounded-sm" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            {/* Area Chart Canvas Placeholder */}
            <div className="h-60 sm:h-64 w-full rounded-md bg-slate-100 flex items-end justify-between p-4 gap-2">
              {[30, 45, 60, 40, 75, 50, 85, 65, 90, 70, 80, 95].map((h, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* 3 Top Category Cards Strip */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-slate-200/80 bg-white flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-20 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-4 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Kabar Penyaluran Terbaru */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-44 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
            <DonorReportListSkeleton count={2} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM KANAN (4 KANVAS: KATEGORI + TRANSAKSI + TARGET + RUTIN) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* 1. Kategori Donasi (Semi-circle Gauge Donut) */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <Skeleton className="h-5 w-36 rounded-sm" />

            {/* Gauge Semi-circle Placeholder */}
            <div className="h-44 w-full flex flex-col items-center justify-end relative pb-3">
              <div className="w-44 h-22 border-t-[14px] border-l-[14px] border-r-[14px] border-slate-200 rounded-t-full flex items-end justify-center pb-1">
                <div className="text-center space-y-1 pb-1">
                  <Skeleton className="h-3 w-16 mx-auto rounded" />
                  <Skeleton className="h-4.5 w-20 mx-auto rounded" />
                </div>
              </div>
            </div>

            {/* Category Legend Rows */}
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-1.5 h-1.5 rounded-full" />
                    <Skeleton className="h-3.5 w-24 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Transaksi Terakhir */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
            </div>
            <DonorListSkeleton count={4} />
          </div>

          {/* 3. Target Kebaikan Bulan Ini */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-44 rounded-sm" />
              <Skeleton className="h-4 w-10 rounded-sm" />
            </div>
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-6 w-28 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            <Skeleton className="h-8.5 w-full rounded-md" />
          </div>

          {/* 4. Donasi Rutin Tersimpan */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
            <DonorListSkeleton count={2} />
            <Skeleton className="h-8.5 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
