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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-lg border border-slate-200 gap-1 overflow-x-auto max-w-full">
            <Skeleton className="h-9 w-20 rounded-md bg-slate-300 shrink-0" />
            <Skeleton className="h-9 w-16 rounded-md shrink-0" />
            <Skeleton className="h-9 w-16 rounded-md shrink-0" />
            <Skeleton className="h-9 w-28 rounded-md shrink-0" />
            <Skeleton className="h-9 w-26 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 space-y-6 shadow-xs">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-40 rounded" />
              <Skeleton className="h-4 w-full max-w-lg rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-3.5 w-72 max-w-full rounded" />
              </div>
            </div>

            <Skeleton className="h-14 w-full rounded-md bg-emerald-50/70 border border-emerald-200/60" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24 min-h-[360px] flex flex-col items-center justify-center p-8 rounded-lg bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 mx-auto rounded" />
              <Skeleton className="h-5 w-32 mx-auto rounded" />
            </div>
            <Skeleton className="h-4 w-56 mx-auto rounded" />
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 space-y-1.5">
            <Skeleton className="h-6 w-64 rounded" />
            <Skeleton className="h-4 w-full max-w-lg rounded" />
          </div>

          <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 flex items-center gap-6">
            <Skeleton className="h-4 w-8 rounded shrink-0" />
            <Skeleton className="h-4 w-24 rounded shrink-0" />
            <Skeleton className="h-4 w-24 rounded flex-1" />
            <Skeleton className="h-4 w-16 rounded shrink-0" />
            <Skeleton className="h-4 w-32 rounded shrink-0" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={`guide-skel-${row}`} className="px-4 py-3.5 flex items-center gap-6">
                <Skeleton className="h-4 w-8 rounded shrink-0" />
                <Skeleton className="h-4 w-24 rounded shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-5 w-20 rounded-md shrink-0" />
                <Skeleton className="h-4 w-32 rounded shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
