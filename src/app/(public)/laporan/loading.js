import { Skeleton } from "@/components/ui/skeleton";

export default function LaporanLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner - Centered Dark Theme */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-80 bg-slate-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-slate-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-slate-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

      {/* Section 1: Ikhtisar Keuangan & Program (Bilah Samping Unified Container Skeleton) */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-56 rounded" />

        <div className="bg-transparent">
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
            {/* Bilah Samping Skeleton (Tanpa border luar, murni divide-y) */}
            <div className="w-full lg:w-64 xl:w-72 shrink-0 divide-y divide-slate-200 flex flex-col justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="py-3 sm:py-3.5 space-y-1">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-5.5 w-36 rounded" />
                  <Skeleton className="h-4 w-44 rounded" />
                </div>
              ))}
            </div>

            {/* Sisi Kanan: Top 5 Program & Kontrol Filter (dengan card wrapper) */}
            <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-44 rounded" />
                  <Skeleton className="h-4 w-64 rounded" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-8.5 w-28 rounded-lg" />
                  <Skeleton className="h-8.5 w-24 rounded-lg" />
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="w-6 h-4 rounded shrink-0" />
                      <Skeleton className="w-12 h-12 rounded-md shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/3 rounded" />
                      </div>
                    </div>
                    <div className="sm:w-60 md:w-64 space-y-2 shrink-0">
                      <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-16 rounded" />
                        <Skeleton className="h-3.5 w-24 rounded" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Rincian Laporan Keuangan (Bar Chart + Donut Chart) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-6 w-60 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Bar Chart Container */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-48 rounded" />
            <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-3 pt-4">
              {[40, 65, 55, 80, 70, 95, 60, 85, 50, 75, 90, 65].map((h, idx) => (
                <Skeleton key={idx} className="w-full rounded-t-md" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Donut Chart Container */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="flex justify-center py-4">
              <Skeleton className="w-44 h-44 rounded-full" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Rincian Arus Kas (Area Chart + Pie Chart) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Area Chart Container */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-48 rounded" />
            <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-3 pt-4">
              {[30, 50, 45, 70, 60, 85, 55, 75, 45, 65, 80, 60].map((h, idx) => (
                <Skeleton key={idx} className="w-full rounded-t-md" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Pie Chart Container */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="flex justify-center py-4">
              <Skeleton className="w-44 h-44 rounded-full" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
);
}

