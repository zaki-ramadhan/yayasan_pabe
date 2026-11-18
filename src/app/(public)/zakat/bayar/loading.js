import { Skeleton } from "@/components/ui/Skeleton";

export default function ZakatBayarLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2 border-b border-slate-200">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-72 max-w-full rounded" />
              </div>
              <Skeleton className="h-4 w-32 rounded self-start sm:self-auto shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={`type-skel-${i}`}
                  className="p-3.5 sm:p-4 rounded-lg border border-slate-200 flex flex-col justify-between min-h-[96px] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4.5 w-28 rounded" />
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <Skeleton className="h-3.5 w-full rounded" />
                    <Skeleton className="h-3.5 w-4/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1 pb-2 border-b border-slate-200">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-60 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={`preset-skel-${i}`} className="h-11 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1 pb-2 border-b border-slate-200">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <Skeleton className="w-4 h-4 rounded mt-0.5 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`qris-${i}`}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3"
                    >
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
                    <div
                      key={`va-${i}`}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3"
                    >
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-11 h-6 rounded shrink-0" />
                      <Skeleton className="h-4 w-56 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-3.5 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-slate-200">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
            <div className="space-y-2 pt-0.5">
              <Skeleton className="h-8 w-3/4 ml-auto rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-slate-200">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-56 rounded" />
            </div>
            <div className="space-y-2.5 pt-1 text-sm">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
