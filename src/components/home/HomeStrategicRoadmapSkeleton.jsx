import { Skeleton } from "@/components/ui/Skeleton";

const SHORT_TERM_STAGGERS = [
  "lg:pt-28",
  "lg:pt-20",
  "lg:pt-14",
  "lg:pt-7",
  "lg:pt-0",
];

const LONG_TERM_STAGGERS = [
  "lg:pt-0",
  "lg:pt-10",
  "lg:pt-20",
  "lg:pt-28",
];

/**
 * HomeStrategicRoadmapSkeleton
 * Skeleton loader kontekstual presisi untuk seksi Program Kerja di Beranda.
 * Merefleksikan 1:1 struktur layout 2 kolom header, 5 kolom jangka pendek,
 * 4 kolom jangka panjang dengan elevasi bertingkat, serta banner narasi.
 */
export function HomeStrategicRoadmapSkeleton() {
  return (
    <section className="bg-white border-y border-slate-200/90 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Skeleton Program Kerja Jangka Pendek */}
        <div className="space-y-8">
          {/* Header 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end pb-4 border-b border-slate-100">
            <div className="lg:col-span-6 space-y-2">
              <Skeleton className="h-8 sm:h-9 lg:h-10 w-72 max-w-full rounded-lg" />
            </div>
            <div className="lg:col-span-6 space-y-1.5">
              <Skeleton className="h-4 sm:h-4.5 w-full rounded" />
              <Skeleton className="h-4 sm:h-4.5 w-4/5 rounded" />
            </div>
          </div>

          {/* Grid 5 Kolom Bertingkat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isFirst = idx === 0;
              const isLast = idx === 4;
              return (
                <div
                  key={idx}
                  className={`flex flex-col justify-start ${SHORT_TERM_STAGGERS[idx]} ${
                    !isLast ? "lg:border-r lg:border-slate-200/90 lg:pr-6 xl:pr-8" : ""
                  } ${
                    !isFirst ? "lg:pl-6 xl:pl-8" : ""
                  } border-l-2 border-slate-200 pl-4 py-2 lg:border-l-0 lg:py-0 space-y-2.5`}
                >
                  <Skeleton className="h-5 sm:h-6 w-3/4 rounded" />
                  <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* 2. Skeleton Program Kerja Jangka Panjang */}
      <div className="space-y-8">
        {/* Header 2 Kolom (Mirrored: Judul di Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end pb-4 border-b border-slate-100">
          <div className="lg:col-span-6 lg:order-2 flex flex-col lg:items-end space-y-2">
            <Skeleton className="h-8 sm:h-9 lg:h-10 w-72 max-w-full rounded-lg" />
          </div>
          <div className="lg:col-span-6 lg:order-1 flex flex-col lg:items-end space-y-1.5">
            <Skeleton className="h-4 sm:h-4.5 w-full rounded" />
            <Skeleton className="h-4 sm:h-4.5 w-4/5 rounded" />
          </div>
        </div>

        {/* Grid 4 Kolom Bertingkat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {[0, 1, 2, 3].map((idx) => {
            const isFirst = idx === 0;
            const isLast = idx === 3;
            return (
              <div
                key={idx}
                className={`flex flex-col justify-start ${LONG_TERM_STAGGERS[idx]} ${
                  !isLast ? "lg:border-r lg:border-slate-200/90 lg:pr-6 xl:pr-8" : ""
                } ${
                  !isFirst ? "lg:pl-6 xl:pl-8" : ""
                } border-l-2 border-slate-200 pl-4 py-2 lg:border-l-0 lg:py-0 space-y-2.5`}
              >
                <Skeleton className="h-5 sm:h-6 w-3/4 rounded" />
                <div className="space-y-1.5 pt-1">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Skeleton Banner Narasi Penutup */}
        <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <Skeleton className="h-4 sm:h-4.5 w-full rounded" />
          <Skeleton className="h-4 sm:h-4.5 w-5/6 rounded" />
        </div>
      </div>
    </div>
  </section>
);
}
