import { Skeleton } from "@/components/ui/skeleton";

export default function DonorPortalLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Title */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Left Column (8 cols): Metrics + Chart + Reports */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* Main Balance Banner */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-52 rounded-md" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded" />
              ))}
            </div>
          </div>

          {/* 3 Secondary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-md border border-slate-200/90 bg-sidebar p-4 space-y-2"
              >
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            ))}
          </div>

          {/* Monthly Trend Chart Placeholder */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
            <div className="h-60 w-full rounded bg-slate-100 flex items-end justify-between p-4 gap-2">
              {[30, 45, 60, 40, 75, 50, 85, 65, 90, 70, 80, 95].map((h, i) => (
                <Skeleton key={i} className="w-full rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Recent Reports Card */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-slate-300/80 bg-white flex gap-3 items-center"
                >
                  <Skeleton className="w-12 h-12 rounded shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Category Donut + Transactions + Target + Routine */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* Category Distribution Card */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="flex justify-center py-2">
              <Skeleton className="w-36 h-36 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-slate-300/80 bg-white flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Target Card */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <Skeleton className="h-5 w-44 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between text-xs">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          </div>

          {/* Routine Donations Card */}
          <div className="rounded-md border border-slate-200/90 bg-sidebar p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-slate-300/80 bg-white flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
