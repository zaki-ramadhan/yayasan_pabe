import { Check, Copy } from "lucide-react";

/**
 * Komponen presentasi kanal Bank Virtual Account (BCA, BRI, BNI, Permata, dll)
 *
 * @param {object} props
 * @param {string} props.vaNumber
 * @param {boolean} props.copiedVa
 * @param {Function} props.onCopyVa
 */
export function InvoiceVirtualAccountSection({ vaNumber = "", copiedVa = false, onCopyVa }) {
  return (
    <div className="space-y-3 py-1">
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white shadow-2xs">
        <div>
          <span className="text-xs text-slate-500 block font-normal">
            Nomor Virtual Account
          </span>
          <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
            {vaNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopyVa?.(vaNumber)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          {copiedVa ? (
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
      <p className="text-xs text-slate-500 pt-0.5 leading-relaxed">
        Transfer via m-Banking atau ATM. Terverifikasi otomatis.
      </p>
    </div>
  );
}

