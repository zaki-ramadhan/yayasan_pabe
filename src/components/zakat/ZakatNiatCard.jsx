"use client";

import { ZAKAT_TYPES, ZAKAT_AMIL_PRAYER } from "@/constants/zakatTypes";
import { Card } from "@/components/ui/Card";

export function ZakatNiatCard({ selectedTypeId }) {
  const currentZakat = ZAKAT_TYPES.find((t) => t.id === selectedTypeId) || ZAKAT_TYPES[0];

  return (
    <Card className="p-4 sm:p-5 border-slate-200 bg-emerald-50/40 space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-emerald-950">
          Akad & Niat {currentZakat.label}
        </h4>
        <p className="text-sm font-normal text-slate-600">
          Dianjurkan membaca niat sebelum menuntaskan pembayaran zakat:
        </p>
      </div>

      {/* Teks Arab Niat */}
      <div className="bg-white/80 p-3.5 rounded-lg border border-emerald-200/70 space-y-2">
        <p className="text-right text-lg sm:text-xl font-normal text-slate-900 leading-relaxed font-serif" dir="rtl">
          {currentZakat.niat.arab}
        </p>
        <p className="text-sm font-normal text-emerald-900 italic">
          &ldquo;{currentZakat.niat.latin}&rdquo;
        </p>
        <p className="text-sm font-normal text-slate-700">
          Artinya: {currentZakat.niat.arti}
        </p>
      </div>

      {/* Doa Amil */}
      <div className="pt-1 border-t border-emerald-200/50 space-y-1.5">
        <span className="text-sm font-medium text-emerald-950 block">
          Doa Penerima Zakat (Amil) untuk Muzakki:
        </span>
        <p className="text-right text-base sm:text-lg font-normal text-slate-800 leading-relaxed font-serif" dir="rtl">
          {ZAKAT_AMIL_PRAYER.arab}
        </p>
        <p className="text-sm font-normal text-slate-600">
          Artinya: {ZAKAT_AMIL_PRAYER.arti}
        </p>
      </div>
    </Card>
  );
}

