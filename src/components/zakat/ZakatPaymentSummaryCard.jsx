"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/formatters";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { ShieldCheck, Loader2 } from "lucide-react";

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
    <Card className="p-5 sm:p-6 border-slate-200 bg-white shadow-2xs space-y-5 sticky top-24">
      <div className="space-y-1 pb-3 border-b border-slate-100">
        <h3 className="text-base font-medium text-slate-900">
          Ringkasan zakat
        </h3>
        <p className="text-sm font-normal text-slate-500">
          Tinjau rincian setoran sebelum melanjutkan ke pembayaran.
        </p>
      </div>

      <div className="space-y-3 text-sm font-normal">
        <div className="flex items-center justify-between text-slate-600">
          <span>Kategori</span>
          <span className="font-medium text-slate-800 text-right">
            {currentZakat.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Metode Pembayaran</span>
          <span className="font-medium text-slate-800 text-right">
            {selectedChannel?.name || "Pilih Saluran"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Nominal Zakat</span>
          <span className="font-medium text-slate-800">
            {formatRupiah(safeAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Biaya Transaksi</span>
          <span className="font-medium text-emerald-600">
            Gratis (Disubsidi Yayasan)
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-base font-medium text-slate-900">
            Total Kewajiban
          </span>
          <span className="text-lg font-medium text-primary">
            {formatRupiah(safeAmount)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!isReady}
        className="w-full h-12 text-sm font-medium transition-all"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memproses pembayaran...
          </span>
        ) : (
          "Tunaikan Zakat Sekarang"
        )}
      </Button>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/80">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm font-normal leading-relaxed">
          Zakat Anda disalurkan secara amanah kepada 8 asnaf mustahik terverifikasi serta diterbitkan Bukti Setor Zakat resmi.
        </p>
      </div>
    </Card>
  );
}

