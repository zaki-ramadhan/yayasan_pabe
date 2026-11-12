import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shared loading skeleton untuk halaman form checkout donasi (/program/[slug]/donate dan /zis/[slug]/donate).
 */
export function CampaignDonateSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <Skeleton className="h-4 w-44 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 space-y-4">
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

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-44 rounded" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={`qris-${i}`} className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3">
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-11 h-6 rounded shrink-0" />
                      <Skeleton className="h-4 w-48 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={`va-${i}`} className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3">
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-11 h-6 rounded shrink-0" />
                      <Skeleton className="h-4 w-56 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-56 rounded" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white p-5 sm:p-6 rounded-xl space-y-4 shadow-xs border border-slate-300">
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

            <div className="pt-2">
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

