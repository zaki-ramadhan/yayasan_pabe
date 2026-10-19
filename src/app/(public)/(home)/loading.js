import { Skeleton } from "@/components/ui/skeleton";
import { CampaignCardSkeleton } from "@/components/shared/CampaignCardSkeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-10 sm:space-y-12 pb-14 animate-pulse">
      {/* 1. Hero Section with Quick Donate Card */}
      <section className="relative bg-slate-900 border-b border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Headline & Trust Badges */}
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-6 w-36 bg-slate-800 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-12 w-full max-w-xl bg-slate-800 rounded-lg" />
              <Skeleton className="h-10 sm:h-12 w-3/4 max-w-lg bg-slate-800 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 sm:h-5 w-full max-w-lg bg-slate-800 rounded" />
              <Skeleton className="h-4 sm:h-5 w-4/5 max-w-md bg-slate-800 rounded" />
            </div>
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-11 w-40 bg-slate-800 rounded-lg" />
              <Skeleton className="h-11 w-36 bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Right: Quick Donate Card Placeholder */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-300 shadow-xl space-y-4">
            <div className="space-y-1 pb-2 border-b border-slate-100">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-52 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* 2. Mitra Logo Badges Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 border-y border-slate-200 flex items-center justify-between gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-28 rounded shrink-0" />
          ))}
        </div>
      </section>

      {/* 3. Featured Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 sm:h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <CampaignCardSkeleton key={n} />
          ))}
        </div>
      </section>

      {/* 4. Transparency Metrics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="space-y-1.5 pb-2">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-7 w-36 rounded" />
              <Skeleton className="h-3.5 w-44 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
