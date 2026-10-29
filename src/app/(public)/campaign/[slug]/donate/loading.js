import { Skeleton } from "@/components/ui/Skeleton";

export default function DonateLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 animate-pulse">
      {/* Back button & Title */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-44 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
      </div>

      {/* Checkout Form 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Input Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Nominal Presets Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-48 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* 2. Payment Channel Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-52 rounded" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-44 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Donor Data & Prayer Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-56 rounded" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mini Campaign Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-300 space-y-3 shadow-2xs">
            <Skeleton className="h-3.5 w-32 rounded" />
            <div className="flex gap-4 items-center">
              <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl space-y-5 shadow-xs border border-slate-300">
            <div className="border-b border-slate-200 pb-3.5 space-y-1">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-3.5 w-56 rounded" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-7 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
