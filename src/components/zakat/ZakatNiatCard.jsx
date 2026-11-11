"use client";

import { ZAKAT_TYPES } from "@/constants/zakatTypes";

export function ZakatNiatCard({ selectedTypeId }) {
  const currentZakat = ZAKAT_TYPES.find((t) => t.id === selectedTypeId) || ZAKAT_TYPES[0];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <div className="space-y-1 pb-3 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900">
          Akad &amp; Niat {currentZakat.label}
        </h3>
        <p className="text-sm font-normal text-slate-600">
          Dianjurkan membaca lafadz niat sebelum menuntaskan pembayaran zakat:
        </p>
      </div>

      {/* Teks Arab Niat (Lega tanpa nested background & padding) */}
      <div className="space-y-2 pt-0.5">
        <p className="text-right text-xl sm:text-2xl font-normal text-slate-900 leading-relaxed font-serif" dir="rtl">
          {currentZakat.niat.arab}
        </p>
        <p className="text-sm font-normal text-slate-700 italic">
          &ldquo;{currentZakat.niat.latin}&rdquo;
        </p>
        <p className="text-xs sm:text-sm font-normal text-slate-600">
          <span className="font-medium text-slate-800">Artinya:</span> {currentZakat.niat.arti}
        </p>
      </div>
    </div>
  );
}

