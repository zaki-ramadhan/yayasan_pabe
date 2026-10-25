import { Skeleton } from "@/components/ui/skeleton";
import { CampaignCardMinimalSkeleton } from "@/components/home/CampaignCardMinimalSkeleton";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";
import { HomeStrategicRoadmapSkeleton } from "@/components/home/HomeStrategicRoadmapSkeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-28 pb-20 sm:pb-24 animate-pulse">
      {/* 1. Hero Section with Quick Donate (Light theme matching HomeHero) */}
      <section className="relative overflow-hidden border-b border-slate-300 py-14 sm:py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
            {/* Left: Headline, Subtitle & Buttons */}
            <div className="flex-1 max-w-2xl space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-9 sm:h-11 lg:h-12 w-full max-w-xl rounded-lg" />
                <Skeleton className="h-9 sm:h-11 lg:h-12 w-3/4 max-w-lg rounded-lg" />
              </div>

              <div className="space-y-2 max-w-xl">
                <Skeleton className="h-4 sm:h-5 w-full rounded" />
                <Skeleton className="h-4 sm:h-5 w-4/5 rounded" />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Skeleton className="h-12 w-48 rounded-lg" />
                <Skeleton className="h-12 w-44 rounded-lg" />
              </div>
            </div>

            {/* Right: Quick Donate Folder Skeleton */}
            <div className="w-full lg:w-[500px] shrink-0 flex justify-center lg:justify-end">
              <div className="relative w-full aspect-[592/458] min-h-[380px] sm:min-h-[390px]">
                <img
                  src="/img/folder%20hero.svg"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none drop-shadow-md opacity-80"
                />

                <div className="relative z-10 h-full flex flex-col justify-end pt-12 pb-9 sm:pb-11 px-6 sm:px-7 space-y-3 sm:space-y-3.5">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-3.5 w-56 rounded" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 py-1">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-11 rounded-lg" />
                    ))}
                  </div>

                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mitra & Lembaga Resmi Section (Centered Header & Borderless Logos) */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-8 sm:h-9 lg:h-10 w-72 max-w-full mx-auto rounded-lg" />
            <Skeleton className="h-4 w-96 max-w-full mx-auto rounded" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-14 pt-2">
            <Skeleton className="h-12 sm:h-14 w-28 sm:w-32 rounded-lg" />
            <Skeleton className="h-11 sm:h-12 w-11 sm:w-12 rounded-lg" />
            <Skeleton className="h-8 sm:h-9 w-44 sm:w-52 rounded-lg" />
          </div>
        </div>
      </section>

      {/* 3. Program Donasi Pilihan (Modern Split Layout: Sticky Header Kiri, Grid 2x2 Kanan) */}
      <section className="relative overflow-hidden bg-slate-100/80 border-y border-slate-200 py-12 sm:py-16">
        {/* Background Line Decoration Overlay (Full Lebar & Tinggi, Opacity 20%) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <img
            src="/img/line%20decoration.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            className="absolute inset-0 w-full h-full object-fill opacity-20 pointer-events-none select-none"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Kolom Kiri: Sticky Header Skeleton */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="space-y-2 sm:space-y-2.5">
                <Skeleton className="h-8 sm:h-9 lg:h-10 w-72 max-w-full rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 sm:h-4.5 w-full max-w-md rounded" />
                  <Skeleton className="h-4 sm:h-4.5 w-4/5 max-w-sm rounded" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <div className="pt-1">
                <Skeleton className="h-9 sm:h-9.5 w-48 rounded-lg" />
              </div>
            </div>

            {/* Kolom Kanan: Grid 2x2 Kartu Program Minimalis (4 Kartu) */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex h-full">
                    <CampaignCardMinimalSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Transparansi & Audit Keuangan (12-col grid: Chart on Left, Summary on Right) */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-8 sm:h-9 lg:h-10 w-80 sm:w-96 max-w-full mx-auto rounded-lg" />
            <Skeleton className="h-4 w-[28rem] max-w-full mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            {/* Chart Skeleton (8 col) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-4 h-[380px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="w-full h-56 rounded-lg" />
              <div className="flex justify-around">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-3 w-8 rounded" />
                ))}
              </div>
            </div>

            {/* Summary Card Skeleton (4 col) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-4 h-[380px] flex flex-col justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-3.5 w-48 rounded" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Program Kerja Jangka Pendek & Jangka Panjang (Roadmap Section) */}
      <HomeStrategicRoadmapSkeleton />

      {/* 6. Dokumentasi Media Sosial (Instagram Feed Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Skeleton className="h-8 sm:h-9 lg:h-10 w-72 sm:w-80 max-w-full mx-auto rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full mx-auto rounded" />
        </div>

        {/* Profile Card Preview Skeleton */}
        <div className="flex justify-center py-2">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-300 p-4 sm:p-5 flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toggle Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-9 w-48 rounded-full" />
        </div>

        {/* Photo Grid Skeleton (3x3 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded sm:rounded-xl" />
          ))}
        </div>
      </section>

      {/* 6. Artikel & FAQ Grid Section (7 col Articles, 5 col FAQ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Articles Digest (7 col) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 sm:h-7 w-48 sm:w-52 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <ArticleCardSkeleton key={i} isCompact={true} />
              ))}
            </div>
          </div>

          {/* FAQ Accordion (5 col) */}
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-6 sm:h-7 w-44 sm:w-48 rounded-lg" />

            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg border border-slate-200 bg-white px-4 flex items-center justify-between"
                >
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-slate-900 border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-8 sm:h-10 w-full max-w-lg bg-slate-800 rounded-lg" />
              <Skeleton className="h-4 w-3/4 max-w-md bg-slate-800 rounded" />
              <Skeleton className="h-11 w-44 rounded-full bg-slate-800" />
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
