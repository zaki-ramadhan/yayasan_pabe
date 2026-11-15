"use client";

import Link from "next/link";

/**
 * Action buttons at the bottom of the invoice page (WhatsApp Share, Browse Programs)
 * @param {object} props
 * @param {string} props.shareText - Encoded WhatsApp share text
 * @param {string} [props.catalogHref="/program"] - Target catalog URL (/program or /zis)
 */
export function InvoiceActions({ shareText, catalogHref = "/program" }) {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={`https://wa.me/?text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer text-center"
      >
        Bagikan ke WhatsApp
      </a>

      <Link
        href={catalogHref}
        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-lg transition-colors text-center"
      >
        Lihat Program Lainnya
      </Link>
    </div>
  );
}
