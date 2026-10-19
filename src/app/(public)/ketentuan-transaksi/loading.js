import { Skeleton } from "@/components/ui/skeleton";

export default function KetentuanTransaksiLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-5 animate-pulse">
      {/* Centered Page Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto py-2">
        <Skeleton className="h-8 sm:h-9 w-64 mx-auto rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-md mx-auto rounded" />
      </div>

      {/* Table 1: Virtual Account (VA) */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 sm:py-3.5 border-b border-slate-200 bg-slate-50/60 space-y-1">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          <div className="px-4 py-3 bg-slate-50/30 flex justify-between">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3 w-1/2">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-4 w-24 w-1/4 rounded" />
              <Skeleton className="h-4 w-24 w-1/4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Table 2: E-Wallet & QRIS */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 sm:py-3.5 border-b border-slate-200 bg-slate-50/60 space-y-1">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          <div className="px-4 py-3 bg-slate-50/30 flex justify-between">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3 w-1/2">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-4 w-24 w-1/4 rounded" />
              <Skeleton className="h-4 w-24 w-1/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
