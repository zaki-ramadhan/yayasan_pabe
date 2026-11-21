"use client";

import { useMemo } from "react";
import { CheckCircleIcon as CheckCircle2 } from "@solar-icons/react/line-duotone/check-circle";
import { DangerTriangleIcon as AlertTriangle } from "@solar-icons/react/line-duotone/danger-triangle";
import { DangerIcon as AlertOctagon } from "@solar-icons/react/line-duotone/danger";
import { formatRupiah } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";
import { calculateCampaignDisbursementBudget } from "@/lib/distributionConstants";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen visual ringkasan anggaran dan sisa saldo program penyaluran.
 * Menghindari penggunaan karakter dot sebagai pemisah teks sesuai panduan desain.
 *
 * @param {object} props
 * @param {object} props.campaign - Objek program donasi terpilih
 * @param {number} props.inputAmount - Nominal yang sedang diketik pada form
 * @param {boolean} [props.isEditing=false] - Mode edit atau tambah baru
 * @param {number} [props.initialDisbursedAmount=0] - Nominal awal data saat diedit
 */
export function AdminDistributionBudgetInfo({
  campaign,
  inputAmount = 0,
  isEditing = false,
  initialDisbursedAmount = 0,
  onAdjustAmount,
}) {
  const budget = useMemo(() => {
    if (!campaign) return null;

    const collected = Number(campaign.collectedAmount) || 0;
    const disbursed = Number(campaign.totalDisbursed) || 0;

    return calculateCampaignDisbursementBudget({
      collectedAmount: collected,
      totalDisbursed: disbursed,
      currentDisbursementAmount: isEditing ? Number(initialDisbursedAmount) || 0 : 0,
    });
  }, [campaign, isEditing, initialDisbursedAmount]);

  if (!campaign || !budget) {
    return null;
  }

  const requested = Number(inputAmount) || 0;
  const remainingBudget = budget.remainingBudget;
  const isOverBudget = requested > remainingBudget;
  const hasZeroCollected = budget.collectedAmount <= 0;

  const simulatedRemaining = Math.max(0, remainingBudget - requested);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800 select-none">
          Status Anggaran Program
        </span>

        <Badge
          variant={
            hasZeroCollected
              ? "warning"
              : isOverBudget
              ? "danger"
              : "success"
          }
        >
          {hasZeroCollected
            ? "Belum ada dana"
            : isOverBudget
            ? "Melebihi dana"
            : "Dana cukup"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
        <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
          <span className="text-sm text-slate-700 block font-normal leading-none mb-1">
            Total Terkumpul
          </span>
          <span className="text-sm font-medium text-slate-900 block leading-tight">
            {formatRupiah(budget.collectedAmount)}
          </span>
        </div>

        <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
          <span className="text-sm text-slate-700 block font-normal leading-none mb-1">
            Telah Disalurkan
          </span>
          <span className="text-sm font-medium text-slate-900 block leading-tight">
            {formatRupiah(budget.totalDisbursed)}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg p-2.5 border transition-colors",
            isOverBudget
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : "bg-white border-slate-200/80 text-slate-900"
          )}
        >
          <span className="text-sm text-slate-700 block font-normal leading-none mb-1">
            Sisa Dana Tersedia
          </span>
          <span
            className={cn(
              "text-sm font-medium block leading-tight",
              isOverBudget ? "text-rose-600 font-semibold" : "text-emerald-700"
            )}
          >
            {formatRupiah(remainingBudget)}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-sm flex items-center gap-2 border leading-tight select-none",
          hasZeroCollected
            ? "bg-amber-50 text-amber-900 border-amber-200"
            : isOverBudget
            ? "bg-rose-50 text-rose-900 border-rose-200"
            : "bg-emerald-50/80 text-emerald-900 border-emerald-200"
        )}
      >
        {hasZeroCollected ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
        ) : isOverBudget ? (
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1.5">
          <span>
            {hasZeroCollected
              ? "Program donasi ini belum memiliki donasi masuk yang terverifikasi."
              : isOverBudget
              ? `Pengajuan melebihi dana tersedia sebesar ${formatRupiah(requested - remainingBudget)}.`
              : `Batas maksimal alokasi untuk kegiatan ini adalah ${formatRupiah(remainingBudget)}.`}
          </span>
          {isOverBudget && remainingBudget > 0 && onAdjustAmount && (
            <button
              type="button"
              onClick={() => onAdjustAmount(remainingBudget)}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shrink-0 shadow-2xs sm:ml-auto"
            >
              Sesuaikan
            </button>
          )}
          {!isOverBudget && requested > 0 && (
            <span className="text-sm text-emerald-700 whitespace-nowrap">
              Estimasi sisa: {formatRupiah(simulatedRemaining)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
