"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { DonorCard, DonorAmountDisplay } from "@/components/donor/DonorDashboardPrimitives";

export function DonorMonthlyTargetCard({
  currentMonthAchieved = 0,
  currentMonthTarget = 1000000,
}) {
  const targetPercent = Math.min(
    100,
    Math.round((currentMonthAchieved / (currentMonthTarget || 1)) * 100)
  );

  const headerRight = (
    <span className="text-sm font-medium text-emerald-600">
      {targetPercent}%
    </span>
  );

  return (
    <DonorCard
      title="Target Kebaikan Bulan Ini"
      rightElement={headerRight}
    >
      <div className="flex items-baseline justify-between text-sm">
        <DonorAmountDisplay
          amount={currentMonthAchieved}
          prefixClassName="text-xs font-medium text-slate-950"
          valueClassName="text-xl font-medium text-slate-950"
          className="font-medium text-slate-950 flex items-baseline gap-0.5"
        />
        <span className="text-sm text-slate-500 font-normal">
          dari {formatRupiah(currentMonthTarget)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white border border-slate-300/80 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${targetPercent}%` }}
        />
      </div>

      <div className=" flex items-center justify-between text-sm text-slate-600 border-t border-slate-200/80">
        <span>Sisa komitmen kebaikan</span>
        <span className="font-medium text-slate-900">
          {formatRupiah(Math.max(0, currentMonthTarget - currentMonthAchieved))}
        </span>
      </div>

      <Link href="/program" className="block pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8.5 text-sm font-medium rounded-md border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
        >
          Penuhi Target Kebaikan
        </Button>
      </Link>
    </DonorCard>
  );
}
