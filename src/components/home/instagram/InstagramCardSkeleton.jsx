import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton Loader untuk Mini Card Profil Instagram
 */
export function InstagramCardSkeleton() {
  return (
    <div className="relative max-w-sm sm:max-w-md mx-auto w-full pt-2">
      {/* Tooltip Arrow Pointer Skeleton */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-800 rotate-45 rounded-tl-[3px] z-20"
        aria-hidden="true"
      />

      <Card className="w-full rounded-xl bg-slate-900 border-slate-800 shadow-xl overflow-hidden animate-pulse relative z-10">
        <CardContent className="p-0 py-3.5 sm:py-4 space-y-3">
          {/* Header Skeleton: Avatar Ring & Detail Akun */}
          <div className="flex items-center gap-3.5 px-3 sm:px-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-[2.7px] bg-slate-800 shrink-0">
              <Skeleton className="w-full h-full rounded-full bg-slate-700" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32 bg-slate-800 rounded" />
              <Skeleton className="h-3 w-44 bg-slate-800/80 rounded" />
            </div>
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
