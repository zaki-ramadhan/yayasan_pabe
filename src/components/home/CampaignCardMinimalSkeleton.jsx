import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton loader matching the exact dimensions and layout of CampaignCardMinimal
 */
export function CampaignCardMinimalSkeleton({ className }) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full rounded-xl border border-slate-300 bg-white overflow-hidden",
        className
      )}
    >
      {/* 1. Cover Image Area with Integrated Overlay Skeleton */}
      <div className="relative aspect-[16/11] w-full bg-slate-900 overflow-hidden">
        {/* Shimmering base background */}
        <div className="w-full h-full bg-slate-800 animate-pulse" />

        {/* Category Ribbon Placeholder */}
        <div className="absolute top-2.5 left-0 z-20">
          <Skeleton className="h-5 sm:h-5.5 w-20 rounded-r bg-slate-700/70" />
        </div>

        {/* Bottom Overlay Skeleton (Title + Location) */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-4.5 space-y-2 z-10 pointer-events-none">
          <div className="space-y-1.5">
            <Skeleton className="h-4.5 sm:h-5 w-full rounded bg-slate-700/80" />
            <Skeleton className="h-4.5 sm:h-5 w-4/5 rounded bg-slate-700/80" />
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0 bg-slate-700/80" />
            <Skeleton className="h-3.5 w-28 rounded bg-slate-700/80" />
          </div>
        </div>
      </div>

      {/* 2. Body Minimalis (Progress Bar, Nominal Terkumpul, CTA) */}
      <div className="flex flex-col flex-1 justify-between px-3 sm:px-3.5 pt-3.5 sm:pt-4 pb-2.5 sm:pb-3 space-y-3">
        <div className="space-y-2">
          {/* Progress Bar Skeleton */}
          <Skeleton className="h-1.5 w-full rounded-full" />

          {/* Deret Nominal Terkumpul Skeleton */}
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-4 sm:h-4.5 w-24 rounded" />
            <div className="flex items-baseline gap-1.5">
              <Skeleton className="h-5 sm:h-6 w-28 rounded" />
              <Skeleton className="h-4 w-9 rounded" />
            </div>
          </div>
        </div>

        {/* Tombol Donasi CTA Skeleton */}
        <Skeleton className="w-full h-8.5 sm:h-9 rounded-lg mt-auto" />
      </div>
    </div>
  );
}
