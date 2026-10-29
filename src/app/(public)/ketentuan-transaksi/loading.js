import { Skeleton } from "@/components/ui/Skeleton";

export default function KetentuanTransaksiLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner - Centered Dark Theme */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-8 sm:h-10 w-64 bg-slate-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-xl bg-slate-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-md bg-slate-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Section 1: AkadTermsSection Skeleton (Tanpa outer border/padding) */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-64 rounded" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card 0: Blue Themed */}
            <div className="p-4 sm:p-5 rounded-lg border border-blue-900/60 bg-blue-950/80 space-y-2 shadow-xs">
              <Skeleton className="h-5 w-40 bg-blue-800/80 rounded" />
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="h-3.5 w-full bg-blue-900/60 rounded" />
                <Skeleton className="h-3.5 w-5/6 bg-blue-900/60 rounded" />
              </div>
            </div>

            {/* Card 1: White Card */}
            <div className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white space-y-2 shadow-2xs">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
              </div>
            </div>

            {/* Card 2: White Card */}
            <div className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white space-y-2 shadow-2xs">
              <Skeleton className="h-5 w-44 rounded" />
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
              </div>
            </div>

            {/* Card 3: Slate Themed */}
            <div className="p-4 sm:p-5 rounded-lg border border-slate-700/60 bg-slate-900 space-y-2 shadow-xs">
              <Skeleton className="h-5 w-40 bg-slate-700 rounded" />
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="h-3.5 w-full bg-slate-800 rounded" />
                <Skeleton className="h-3.5 w-5/6 bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 & 3: Split Kanan-Kiri Tabel Batas Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-start">
          {/* Table 1: Virtual Account (VA) (2 channels) */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-52 rounded" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-3 bg-slate-50/50 flex justify-between">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="px-4 py-3.5 flex justify-between items-center">
                    <div className="flex items-center gap-3 w-1/2">
                      <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                      <Skeleton className="h-4 w-28 rounded" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table 2: E-Wallet & QRIS (5 channels) */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-56 rounded" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-3 bg-slate-50/50 flex justify-between">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-4 py-3.5 flex justify-between items-center">
                    <div className="flex items-center gap-3 w-1/2">
                      <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
