"use client";

import { useState } from "react";
import { Check, Copy, ChevronRight } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";

/**
 * Komponen presentasi kanal Bank Mandiri Multipayment (Biller Code + Bill Key)
 *
 * @param {object} props
 * @param {string} props.billerCode
 * @param {string} props.billKey
 */
export function InvoiceMandiriSection({ billerCode = "70012", billKey = "" }) {
  const [copiedBiller, setCopiedBiller] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopy = async (text, setCopiedFn, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedFn(true);
      toast.success(`${label} berhasil disalin.`);
      setTimeout(() => setCopiedFn(false), 2000);
    } else {
      toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
    }
  };

  return (
    <div className="space-y-3.5 py-1">
      {/* Kartu Rincian Mandiri Multipayment */}
      <div className="rounded-xl border border-slate-300 bg-slate-50/70 divide-y divide-slate-200 overflow-hidden shadow-2xs">
        {/* Baris 1: Kode Perusahaan */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500 block font-normal">
              Kode Perusahaan
            </span>
            <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
              {billerCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(billerCode, setCopiedBiller, "Kode Perusahaan")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            {copiedBiller ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Baris 2: Nomor Pelanggan / Kode Bayar */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white">
          <div>
            <span className="text-xs text-slate-500 block font-normal">
              Nomor Pelanggan (Kode Bayar)
            </span>
            <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
              {billKey}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(billKey, setCopiedKey, "Nomor Pelanggan")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            {copiedKey ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1 pt-0.5">
        <span className="text-xs font-semibold text-slate-700 block">
          Panduan singkat:
        </span>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-600 leading-relaxed">
          <span><strong>Livin&apos; by Mandiri</strong></span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
          <span><strong>Bayar</strong></span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
          <span><strong>Kode Perusahaan</strong></span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
          <span><strong>Nomor Pelanggan</strong></span>
        </p>
      </div>
    </div>
  );
}

