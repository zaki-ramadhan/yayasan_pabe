import { Skeleton } from "@/components/ui/Skeleton";

export default function DonateLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* Back button & Title */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-44 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
      </div>

      {/* Checkout Form 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Input Steps */}
        <div className="lg:col-span-7 space-y-4">
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

        {/* Right Column: Sticky Unified Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white p-5 sm:p-6 rounded-xl space-y-4 shadow-xs border border-slate-300">
            {/* Campaign Info Section */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <Skeleton className="h-4 w-48 rounded" />
              <div className="flex gap-3.5 items-center">
                <Skeleton className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4.5 w-full rounded" />
                </div>
              </div>
            </div>

            {/* Payment Breakdown Section */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-5 sm:h-6 w-36 rounded" />
                <Skeleton className="h-3.5 w-56 rounded" />
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-6 w-28 rounded" />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
