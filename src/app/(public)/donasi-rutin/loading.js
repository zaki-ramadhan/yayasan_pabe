import { Skeleton } from "@/components/ui/Skeleton";

export default function DonasiRutinLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* 1. Hero: Back Link + Page Header */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-72 rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded" />
        </div>
      </div>

      {/* 2. Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left Column (7 cols): Identity + Program Items */}
        <div className="lg:col-span-7 space-y-4">

          {/* Card: Data Donatur */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <Skeleton className="h-6 w-28 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
          </div>

          {/* Card: Pilihan Program & Jadwal */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs relative">
            <Skeleton className="h-6 w-60 rounded" />

            {/* Pilih program donasi dropdown */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>

            {/* Jadwal donasi rutin dropdown + grid hari */}
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-4 w-36 rounded" />
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                  <Skeleton className="h-10 rounded-lg col-start-2 col-span-1" />
                </div>
              </div>
            </div>

            {/* Model pelaksanaan: 2 card radio */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                </div>
                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                </div>
              </div>
            </div>

            {/* Atur masa berlaku (collapsible toggle) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between py-1">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>

            {/* Jam Pengingat (TimeInput24Hour layout) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <Skeleton className="h-4 w-36 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-16 rounded-lg" />
                <Skeleton className="h-5 w-3 rounded" />
                <Skeleton className="h-11 w-16 rounded-lg" />
                <Skeleton className="h-11 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-3.5 w-80 rounded" />
            </div>

            {/* Auto donation: Nominal grid + Payment channel item */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Ringkasan */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-5 shadow-xs">
            <div className="space-y-0.5">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>

            {/* Summary item */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-3.5 w-44 rounded" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>

            {/* Submit + Help button row */}
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

