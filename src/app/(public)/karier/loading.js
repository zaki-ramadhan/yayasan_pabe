import { Skeleton } from "@/components/ui/skeleton";

export default function KarierLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner */}
      <div className="relative w-full bg-slate-900 border-b border-slate-800 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <Skeleton className="h-8 sm:h-10 w-64 bg-slate-800 rounded-lg" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-slate-800 rounded" />
          <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-slate-800 rounded" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-5">
        {/* Filter Bar (Search + 3 Selects) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Master-Detail Split Grid (12 cols: 5 Left, 7 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column: Master Vacancy List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-300 p-4 sm:p-4.5 space-y-3 shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3.5 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Detail Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-300 p-6 sm:p-7 space-y-6 shadow-xs">
            {/* Header */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
              <Skeleton className="h-7 sm:h-8 w-3/4 rounded-lg" />
              <div className="flex items-center gap-4 text-sm">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-10 w-44 rounded-lg" />
              </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>

            {/* Requirements Section */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <Skeleton className="h-5 w-44 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

