import { Skeleton } from "@/components/ui/Skeleton";

export default function KebijakanPrivasiLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner Skeleton */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-56 bg-slate-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-xl bg-slate-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-md bg-slate-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      {/* Main Single Card Content Skeleton */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-2xs divide-y divide-slate-100">
          {/* Header & Pengantar Skeleton */}
          <div className="pb-6 sm:pb-8 space-y-2.5">
            <Skeleton className="h-6 sm:h-7 w-72 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          </div>

          {/* Konten Poin Terpadu Skeleton (Menjorok & List) */}
          <div className="pt-6 sm:pt-8 space-y-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-3">
                {/* Judul Poin */}
                <Skeleton className="h-5 w-52 sm:w-64 rounded" />

                {/* Konten Menjorok ke Dalam (Indented) */}
                <div className="pl-4 sm:pl-6 space-y-3">
                  {/* Paragraf Pembuka */}
                  <Skeleton className="h-4 w-full max-w-xl rounded" />

                  {/* Bullet Sub-list Items */}
                  <div className="space-y-2.5 pl-4">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      <div className="space-y-1.5 w-full">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-4/5 rounded" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      <div className="space-y-1.5 w-full">
                        <Skeleton className="h-4 w-11/12 rounded" />
                      </div>
                    </div>
                    {i % 2 === 1 && (
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                        <div className="space-y-1.5 w-full">
                          <Skeleton className="h-4 w-5/6 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
