import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      {/* 2-Column Checkout Layout (12 cols: 7 Left, 5 Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metode & Instruksi Pembayaran */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Payment Method Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-5 w-44 rounded-md" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>

            {/* QRIS / VA Code Display Box */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-center flex flex-col items-center">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-8 w-60 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>

            {/* Instruction Accordion List */}
            <div className="space-y-2.5 pt-1">
              <Skeleton className="h-4 w-40 rounded" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lembar Tagihan & Actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Invoice Receipt Card */}
          <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-4 shadow-xs">
            {/* Status & Invoice ID */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Countdown Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>

            {/* Campaign Preview Mini */}
            <div className="p-3 rounded-lg border border-slate-200 flex gap-3 items-center">
              <Skeleton className="w-14 h-14 rounded-md shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            </div>

            {/* Breakdown Amounts */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center text-sm">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}

