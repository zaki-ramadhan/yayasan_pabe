import { Skeleton } from "@/components/ui/skeleton";

export default function DonasiRutinLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* 1. Hero: Back Link + Page Header */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-72 rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded" />
        </div>
      </div>

      {/* 2. Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Column (7 cols): Identity + Program Items */}
        <div className="lg:col-span-7 space-y-6">

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

          {/* Section: Pilih Program & Jadwal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-60 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>

            {/* Program Item Card */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
              <Skeleton className="h-5 w-24 rounded" />

              {/* Pilih program donasi dropdown */}
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>

              {/* Jadwal donasi rutin dropdown */}
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>

              {/* Model pelaksanaan: 2 card radio (1 col mobile, 2 col sm) */}
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

              {/* Mode info banner (REMINDER_ONLY) */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <Skeleton className="h-4 w-52 rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
            </div>

            {/* Add Program Button */}
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column (5 cols): Ringkasan */}
        <div className="lg:col-span-5">
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

