"use client";

import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { formatRupiah, formatDate, decodeHtmlEntities, formatPaymentChannel } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { maskEmail } from "@/lib/security";

export function AdminTransactionTableRow({
  item,
  copiedId,
  onCopyInvoice,
  onOpenDetail,
}) {
  return (
    <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
      {/* Invoice */}
      <TableCell className="w-[170px] text-sm py-3 align-middle">
        <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
          <span className="font-normal font-mono text-slate-700 truncate block select-all">
            {item.invoiceId}
          </span>
          <button
            type="button"
            onClick={() => onCopyInvoice(item.invoiceId)}
            aria-label={`Salin invoice ${item.invoiceId}`}
            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            {copiedId === item.invoiceId ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </TableCell>

      {/* Jenis Transaksi */}
      <TableCell className="w-px py-3 whitespace-nowrap align-middle">
        {item.donationType === "ZAKAT" ? (
          <span
            title="Zakat"
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-sm font-medium max-w-[150px] truncate whitespace-nowrap"
          >
            Zakat
          </span>
        ) : item.routineDonationId || item.isRoutine ? (
          <span
            title="Donasi Rutin"
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-sm font-medium max-w-[150px] truncate whitespace-nowrap"
          >
            Donasi Rutin
          </span>
        ) : (
          <span
            title="Donasi Program"
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-200/80 text-sm font-medium max-w-[150px] truncate whitespace-nowrap"
          >
            Donasi Program
          </span>
        )}
      </TableCell>

      {/* Donatur */}
      <TableCell className="w-px py-3 whitespace-nowrap align-middle">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            src={item.donorAvatar}
            name={item.donorName}
            fallback="D"
            isAnonymous={item.isAnonymous}
          />
          <div className="min-w-0 space-y-0.5">
            <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
              {item.donorName}
            </span>
            {item.donorEmail && (
              <span className="text-sm text-slate-500 block truncate font-normal">
                {maskEmail(item.donorEmail)}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Program */}
      <TableCell className="text-sm text-slate-700 py-3 align-middle min-w-[240px] max-w-[340px]">
        <div className="max-w-[320px]">
          {item.campaignSlug ? (
            <Link
              href={`/campaign/${item.campaignSlug}`}
              target="_blank"
              className="line-clamp-2 leading-snug font-normal text-slate-800 hover:text-primary hover:underline cursor-pointer transition-colors block overflow-hidden"
              aria-label={`Buka program: ${item.campaignTitle}`}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {decodeHtmlEntities(item.campaignTitle)}
            </Link>
          ) : (
            <p
              className="line-clamp-2 leading-snug font-normal text-slate-800 overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {decodeHtmlEntities(item.campaignTitle)}
            </p>
          )}
        </div>
      </TableCell>

      {/* Nominal */}
      <TableCell className="w-px text-right font-medium text-sm text-slate-900 py-3 whitespace-nowrap align-middle tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* Metode */}
      <TableCell className="w-px text-center py-3 whitespace-nowrap align-middle">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-sm font-normal bg-slate-100 border border-slate-200 text-slate-700 max-w-[160px] truncate whitespace-nowrap">
          {formatPaymentChannel(item.paymentChannel)}
        </span>
      </TableCell>

      {/* Tanggal */}
      <TableCell className="w-px text-sm text-slate-500 py-3 whitespace-nowrap align-middle text-center tabular-nums">
        {formatDate(item.paidAt || item.createdAt)}
      </TableCell>

      {/* Status */}
      <TableCell className="w-px text-center py-3 whitespace-nowrap align-middle">
        <StatusBadge status={item.status} />
      </TableCell>

      {/* Aksi: Rincian */}
      <TableCell className="w-24 text-right py-3 whitespace-nowrap align-middle pr-4">
        <TableRowActions
          onView={() => onOpenDetail(item)}
          viewTooltip={`Lihat rincian: ${item.invoiceId}`}
        />
      </TableCell>
    </TableRow>
  );
}
