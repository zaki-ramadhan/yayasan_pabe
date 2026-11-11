import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ZakatBayarLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 rounded-sm" />
        <Skeleton className="h-8 w-72 rounded-md" />
        <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
      </div>

      {/* Grid 2 Kolom Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: 8 Kolom */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Pilihan Jenis Zakat */}
          <Card className="p-5 sm:p-6 border-slate-200 bg-white space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 rounded-sm" />
              <Skeleton className="h-4 w-72 rounded-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <Skeleton className="h-4 w-28 rounded-sm" />
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <Skeleton className="h-3 w-3/4 rounded-sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Card 2: Niat Zakat */}
          <Card className="p-5 sm:p-6 border-slate-200 bg-emerald-50/30 space-y-3">
            <Skeleton className="h-5 w-48 rounded-sm" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
          </Card>

          {/* Card 3: Nominal Input */}
          <Card className="p-5 sm:p-6 border-slate-200 bg-white space-y-4">
            <Skeleton className="h-5 w-44 rounded-sm" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-lg" />
              ))}
            </div>
          </Card>

          {/* Card 4: Muzakki Data */}
          <Card className="p-5 sm:p-6 border-slate-200 bg-white space-y-4">
            <Skeleton className="h-5 w-48 rounded-sm" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </Card>

          {/* Card 5: Payment Channel */}
          <Card className="p-5 sm:p-6 border-slate-200 bg-white space-y-4">
            <Skeleton className="h-5 w-48 rounded-sm" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: 4 Kolom Summary */}
        <div className="lg:col-span-4">
          <Card className="p-5 sm:p-6 border-slate-200 bg-white space-y-5">
            <Skeleton className="h-5 w-36 rounded-sm" />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded-sm" />
                <Skeleton className="h-4 w-28 rounded-sm" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="h-4 w-20 rounded-sm" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="h-4 w-28 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg mt-4" />
          </Card>
        </div>
      </div>
    </main>
  );
}

