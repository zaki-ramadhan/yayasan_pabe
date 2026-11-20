import { Skeleton } from "@/components/ui/Skeleton";

export function DonorCareerSkeleton() {
  return (
    <div className="space-y-3.5 animate-pulse">
      {[1, 2].map((idx) => (
        <div
          key={idx}
          className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 space-y-4 shadow-2xs"
        >
          {/* Card Header: Judul & Badge Status di Kanan Atas */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="space-y-2 min-w-0 flex-1">
              {/* Baris 1: Judul */}
              <Skeleton className="h-5 sm:h-6 w-48 sm:w-60 rounded-md" />
              {/* Baris 2: Detail ber-ikon (Lokasi & Tipe) */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              {/* Baris 3: Divisi */}
              <Skeleton className="h-3.5 w-28 rounded" />
            </div>

            {/* Kanan Atas: Badge Status */}
            <Skeleton className="h-6 w-24 rounded-md shrink-0" />
          </div>

          {/* Stepper Timeline (3 Tahap) */}
          <div className="w-full pt-2 pb-1">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[1, 2, 3].map((stepIdx) => (
                <div key={stepIdx} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                  <Skeleton className="h-3 w-20 sm:w-24 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Card Footer: Tanggal Pengajuan (Kiri) & Tombol Batalkan (Kanan) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
