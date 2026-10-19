import { Skeleton } from "@/components/ui/skeleton";

export default function KalkulatorZakatLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 animate-pulse">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <Skeleton className="h-9 sm:h-10 w-80 max-w-full mx-auto rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-xl mx-auto rounded" />
      </div>

      {/* Tabs & Calculator Layout */}
      <div className="space-y-6">
        {/* Mode Selector Tabs (Centered) */}
        <div className="flex justify-center">
          <div className="flex gap-2 overflow-x-auto p-1.5 bg-slate-100 rounded-xl">
            <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
          </div>
        </div>

        {/* 2-Column Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start pt-2">
          {/* Form Inputs (Left: 7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 space-y-5 shadow-xs">
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-72 max-w-full rounded" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 flex-1 rounded-lg" />
              <Skeleton className="h-11 w-24 rounded-lg" />
            </div>
          </div>

          {/* Results Summary Panel (Right: 5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 space-y-5 shadow-xs sticky top-24">
            <div className="border-b border-slate-200 pb-3 space-y-1">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>

            <div className="space-y-3.5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-7 w-44 rounded-md" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-sm">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-6 w-32 rounded-md" />
                </div>
              </div>
            </div>

            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}

