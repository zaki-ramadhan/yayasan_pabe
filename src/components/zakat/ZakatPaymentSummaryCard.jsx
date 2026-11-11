"use client";

import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/formatters";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { Loader2 } from "lucide-react";

export function ZakatPaymentSummaryCard({
  selectedTypeId,
  amount,
  selectedChannel,
  isSubmitting,
  onSubmit,
}) {
  const currentZakat = ZAKAT_TYPES.find((t) => t.id === selectedTypeId) || ZAKAT_TYPES[0];
  const safeAmount = Number(amount) || 0;
  const isReady = safeAmount >= 10000 && !isSubmitting;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl space-y-4 shadow-xs border border-slate-300">
      <div className="space-y-0.5 pb-3 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-semibold text-slate-950">
          Ringkasan zakat
        </h3>
        <p className="text-sm text-slate-600">
          Tinjau rincian kewajiban sebelum melanjutkan pembayaran.
        </p>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Kategori zakat</span>
          <span className="font-medium text-slate-900 text-right">
            {currentZakat.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Saluran pembayaran</span>
          <span className="font-medium text-slate-900 text-right">
            {selectedChannel?.name || "Pilih Saluran"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Nominal zakat</span>
          <span className="font-medium text-slate-900">
            {formatRupiah(safeAmount)}
          </span>
        </div>

        <div className="flex justify-between items-baseline text-sm font-medium text-slate-950 pt-2.5 border-t border-slate-200">
          <span>Total kewajiban</span>
          <span className="text-primary text-base sm:text-lg font-semibold">
            {formatRupiah(safeAmount)}
          </span>
        </div>
      </div>

      <div className="pt-1">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!isReady}
          variant="primary3d"
          className="w-full h-12 rounded-lg text-base disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses pembayaran...
            </span>
          ) : (
            "Lanjutkan Pembayaran"
          )}
        </Button>
      </div>
    </div>
  );
}

