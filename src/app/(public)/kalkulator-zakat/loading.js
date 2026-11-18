import { Skeleton } from "@/components/ui/Skeleton";

export default function KalkulatorZakatLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-64 bg-slate-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-slate-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-slate-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-lg border border-slate-200 gap-1 overflow-x-auto max-w-full">
            <Skeleton className="h-9 w-24 rounded-md bg-slate-300 shrink-0" />
            <Skeleton className="h-9 w-20 rounded-md shrink-0" />
            <Skeleton className="h-9 w-20 rounded-md shrink-0" />
            <Skeleton className="h-9 w-28 rounded-md shrink-0" />
            <Skeleton className="h-9 w-28 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 space-y-6 shadow-xs">
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-4 w-full max-w-md rounded" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="h-10 w-36 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24 min-h-[360px] flex flex-col items-center justify-center p-8 rounded-lg bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 mx-auto rounded" />
              <Skeleton className="h-5 w-32 mx-auto rounded" />
            </div>
            <div className="space-y-1 pt-1">
              <Skeleton className="h-4 w-60 mx-auto rounded" />
              <Skeleton className="h-4 w-48 mx-auto rounded" />
            </div>
          </div>
        </div>

        <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs space-y-0">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 space-y-1.5">
            <Skeleton className="h-5 w-64 rounded" />
            <Skeleton className="h-3.5 w-full max-w-lg rounded" />
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={`guide-skel-${row}`} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                <Skeleton className="h-4 w-8 rounded shrink-0" />
                <Skeleton className="h-4 w-28 rounded shrink-0" />
                <Skeleton className="h-4 w-36 rounded flex-1" />
                <Skeleton className="h-5 w-16 rounded shrink-0" />
                <Skeleton className="h-4 w-32 rounded shrink-0" />
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-52 rounded" />
              <Skeleton className="h-3.5 w-80 max-w-full rounded" />
            </div>
            <Skeleton className="h-4 w-40 rounded self-start sm:self-auto shrink-0" />
          </div>
        </section>
      </main>
    </div>
  );
}
