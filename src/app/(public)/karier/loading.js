import { Skeleton } from "@/components/ui/skeleton";

export default function KarierLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner - Centered Dark Theme */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-64 bg-neutral-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-neutral-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-neutral-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-5">
        {/* Filter Bar: Row 1 Search Input, Row 2 3-Select Dropdowns */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Skeleton className="h-10 sm:flex-1 rounded-md" />
            <Skeleton className="h-10 sm:flex-1 rounded-md" />
            <Skeleton className="h-10 sm:flex-1 rounded-md" />
          </div>
        </div>

        {/* Master-Detail Split Grid (12 cols: 5 Left, 7 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column: Master Vacancy List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Header: Daftar Posisi */}
            <div className="pb-0.5">
              <Skeleton className="h-6 w-36 rounded" />
            </div>

            {/* 4 Job Cards */}
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 sm:p-4.5 rounded-lg border border-slate-200 bg-white space-y-2 shadow-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-5 w-44 rounded" />
                    {i === 1 && <Skeleton className="h-5 w-12 rounded-full" />}
                  </div>
                  <Skeleton className="h-4 w-32 rounded" />

                  {/* Metadata Row */}
                  <div className="flex items-center gap-3 mt-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </div>

                  {/* Overview Preview */}
                  <div className="space-y-1 pt-1">
                    <Skeleton className="h-3.5 w-full rounded" />
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sticky Detail Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs">
            {/* Header: Title + Department + Action Button */}
            <div className="space-y-3.5 pb-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <Skeleton className="h-7 sm:h-8 w-60 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <Skeleton className="h-10 w-36 rounded-md shrink-0" />
              </div>

              {/* Metadata Items */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-0.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
              </div>
            </div>

            {/* Responsibilities Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-5 w-52 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-5 w-48 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-4 w-56 rounded" />
              </div>
              <Skeleton className="h-10 w-36 rounded-md shrink-0" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
