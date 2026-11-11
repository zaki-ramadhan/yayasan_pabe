import { Skeleton } from "@/components/ui/Skeleton";

export default function ZakatBayarLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
      </div>

      {/* Grid 2 Kolom Skeleton (7 Kolom Kiri & 5 Kolom Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Kolom Kiri: Input Muzakki & Kanal Bayar (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Data Identitas Muzakki */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1 pb-2 border-b border-slate-200">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            {/* Checkbox Hamba Allah */}
            <Skeleton className="h-11 w-full rounded-lg" />
            {/* Nama Lengkap */}
            <Skeleton className="h-11 w-full rounded-lg" />
            {/* Email & Kontak Telepon Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            {/* NPWP / NIK */}
            <Skeleton className="h-11 w-full rounded-lg" />
            {/* Doa Muzakki */}
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* 2. Kanal Pembayaran */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <div className="space-y-4">
              {/* Kategori 1: QRIS & E-Wallet */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`qris-${i}`}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3"
                    >
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-11 h-6 rounded shrink-0" />
                      <Skeleton className="h-4 w-48 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Kategori 2: Virtual Account Bank */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={`va-${i}`}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-200 flex items-center gap-2.5 sm:gap-3"
                    >
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-11 h-6 rounded shrink-0" />
                      <Skeleton className="h-4 w-56 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Sticky Akad & Ringkasan (5 Kolom) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          {/* Akad & Niat Card Skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-3.5 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-slate-200">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
            <div className="space-y-2 pt-0.5">
              <Skeleton className="h-8 w-3/4 ml-auto rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>

          {/* Ringkasan Zakat Card Skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-slate-200">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-56 rounded" />
            </div>
            <div className="space-y-2.5 pt-1 text-sm">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
