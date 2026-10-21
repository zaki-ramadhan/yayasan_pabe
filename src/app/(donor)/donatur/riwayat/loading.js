import { DonorHistorySkeleton } from "@/components/donor/DonorHistorySkeleton";

export default function DonorHistoryLoading() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Riwayat Donasi &amp; Zakat
        </h1>
      </div>
      <DonorHistorySkeleton />
    </div>
  );
}
