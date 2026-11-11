"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/formatters";
import { Calculator, Lock } from "lucide-react";

export function ZakatNominalInputSection({ amount }) {
  const safeAmount = Number(amount) || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-slate-900">
            Nominal kewajiban zakat
          </h3>
          <p className="text-sm text-slate-600">
            Nominal terkunci sesuai hasil perhitungan kalkulator zakat Anda.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 shrink-0">
          <Lock className="w-3 h-3 text-emerald-700" />
          Terkunci
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-300 gap-3">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Nilai Zakat
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {formatRupiah(safeAmount)}
          </span>
        </div>

        <Link
          href="/kalkulator-zakat"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-slate-600" />
          <span>Hitung ulang di kalkulator</span>
        </Link>
      </div>
    </div>
  );
}

