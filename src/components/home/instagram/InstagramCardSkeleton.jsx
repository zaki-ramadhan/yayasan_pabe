import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton Loader untuk Mini Card Profil Instagram
 */
export function InstagramCardSkeleton() {
  return (
    <div className="relative max-w-sm sm:max-w-md mx-auto w-full">
      {/* Tooltip Arrow Pointer Skeleton */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-800 rotate-45 rounded-tl-[3px] z-20"
        aria-hidden="true"
      />

      <Card className="w-full rounded-xl bg-slate-900 border-slate-800 shadow-xl overflow-hidden animate-pulse relative z-10">
        <CardContent className="p-0 py-3.5 sm:py-4 space-y-3 sm:space-y-3.5">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3.5 px-3 sm:px-3.5">
            <Skeleton className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28 bg-slate-800 rounded" />
              <Skeleton className="h-3 w-36 bg-slate-800 rounded" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 sm:px-3.5 border-t border-b border-slate-800/80">
            <Skeleton className="h-8 w-full bg-slate-800 rounded" />
            <Skeleton className="h-8 w-full bg-slate-800 rounded" />
            <Skeleton className="h-8 w-full bg-slate-800 rounded" />
          </div>

          {/* Mini Grid Skeleton */}
          <div className="grid grid-cols-3 gap-[2px] w-full bg-slate-950">
            <Skeleton className="aspect-square w-full bg-slate-800 rounded-none" />
            <Skeleton className="aspect-square w-full bg-slate-800 rounded-none" />
            <Skeleton className="aspect-square w-full bg-slate-800 rounded-none" />
          </div>

          {/* Button Skeleton */}
          <div className="px-3 sm:px-3.5 pt-0.5">
            <Skeleton className="h-8.5 sm:h-9 w-full bg-slate-800 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
