import Image from "next/image";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DistribusiLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner - Centered Dark Theme */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-72 bg-slate-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-slate-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-slate-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 lg:space-y-10">

      {/* Grid 2 Kolom: Baris 1 = 2 Laporan Chart */}
      <div className="space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-10 border-b border-slate-200">
          {/* Section 1: Laporan Keuangan Audit */}
          <div className="space-y-4">
            {/* Header: Title + Accent bar + Action Link (No bottom border) */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-xs bg-primary shrink-0" />
                  <Skeleton className="h-6 w-52 rounded" />
                </div>
                <Skeleton className="h-4 w-72 sm:w-80 rounded ml-3.5" />
              </div>
              <Skeleton className="h-4 w-20 rounded" />
            </div>

            {/* Donut Chart Canvas & Legend */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-12 w-full py-1">
              {/* Donut Ring with Center Hole Label */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-[18px] border-slate-200 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Skeleton className="h-3.5 w-12 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                  </div>
                </div>
              </div>

              {/* Clean Legend: 4 Rows */}
              <div className="w-full md:max-w-md divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Skeleton className="w-3 h-3 rounded-xs shrink-0" />
                      <Skeleton className="h-4 w-28 sm:w-36 rounded" />
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <Skeleton className="h-4 w-24 rounded hidden sm:inline-block" />
                      <Skeleton className="h-4 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Flat Key Metrics (2 Kolom, Border-t, No Cards) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-5 w-36 max-w-full rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Laporan Distribusi */}
          <div className="space-y-4">
            {/* Header: Title + Accent bar + Year Filter Select */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-xs bg-primary shrink-0" />
                  <Skeleton className="h-6 w-44 rounded" />
                </div>
                <Skeleton className="h-4 w-72 sm:w-80 rounded ml-3.5" />
              </div>
              <Skeleton className="h-8 sm:h-9 w-28 rounded-md" />
            </div>

            {/* Area Chart Canvas */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-full h-52 sm:h-56 relative flex flex-col justify-between pt-2 pb-1">
                {/* Horizontal Grid lines with Y-Axis label skeletons */}
                <div className="space-y-6 w-full">
                  {[1, 2, 3, 4].map((line) => (
                    <div key={line} className="flex items-center gap-2 w-full">
                      <Skeleton className="h-3 w-8 rounded shrink-0" />
                      <div className="h-px bg-slate-100 flex-1" />
                    </div>
                  ))}
                </div>

                {/* Simulated Spline Area Wave Placeholder */}
                <div className="h-24 w-full bg-gradient-to-t from-sky-100/60 to-transparent rounded-b-md relative overflow-hidden flex items-end">
                  <div className="w-full h-1 bg-sky-200 rounded-full" />
                </div>

                {/* X-Axis Month Skeletons */}
                <div className="flex justify-between items-center w-full pt-2 px-1">
                  {["Jan", "Mar", "Mei", "Jul", "Sep", "Nov"].map((m) => (
                    <Skeleton key={m} className="h-3 w-6 rounded" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-4 w-72 rounded mx-auto mt-2" />
            </div>

            {/* 4 Flat Key Metrics (2 Kolom, Border-t, No Cards) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-5 w-32 max-w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Section 3 Berada di Tengah Sumbu X (SK Dewan Pengawas Syariah - Chart Terakhir) */}
        <div className="flex justify-center pb-8 sm:pb-10 border-b border-slate-200">
          <div className="w-full max-w-2xl space-y-4">
            {/* Header: Title + Accent Bar + Action Link */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-xs bg-primary shrink-0" />
                  <Skeleton className="h-6 w-56 rounded" />
                </div>
                <Skeleton className="h-4 w-72 sm:w-96 rounded ml-3.5" />
              </div>
              <Skeleton className="h-4 w-24 rounded" />
            </div>

            {/* Radar Chart Container */}
            <div className="w-full h-52 sm:h-56 flex items-center justify-center">
              <div className="relative w-44 h-44 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-200/60" />
                </div>
              </div>
            </div>

            {/* 4 Flat Key Metrics (2 Cols mobile, 4 Cols desktop, Border-t) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 sm:gap-6 gap-3 text-sm">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-5 w-32 max-w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daftar Transparansi Penerima Manfaat Skeleton (Setelah Seluruh Chart) */}
        <div className="space-y-6">
          {/* Heading: Tanpa padding, font-medium, tanpa subheading */}
          <div>
            <Skeleton className="h-7 w-72 rounded-md" />
          </div>

          {/* Stats Bar Cards Bentuk Folder Putih Polos (2 Baris Tanpa Icon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative w-full aspect-[363/224]"
              >
                <Image
                  src="/img/frames/folder-admin.svg"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-fill pointer-events-none select-none opacity-80"
                />
                <div className="relative z-10 h-full flex flex-col justify-end pb-3.5 sm:pb-4 md:pb-4.5 px-3.5 sm:px-4 md:px-5 space-y-1">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-6 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Toolbar & Single Full-Width Table Skeleton */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-44 rounded-lg" />
                <Skeleton className="h-10 w-40 sm:w-44 rounded-lg" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                <div className="bg-slate-50/90 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-52 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((rowIdx) => (
                  <div key={rowIdx} className="px-4 py-3.5 flex items-center justify-between">
                    <Skeleton className="h-3.5 w-8 rounded" />
                    <Skeleton className="h-4 w-56 rounded" />
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </div>
                ))}
              </div>

              {/* Pagination footer skeleton inside container */}
              <div className="px-4 py-3 border-t border-slate-200/90 bg-white flex items-center justify-between">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-8 w-56 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
