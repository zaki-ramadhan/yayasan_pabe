"use client";

import { Copy, Check, ShieldCheck } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { maskEmail } from "@/lib/security";

export function AdminTransactionTableRow({
  item,
  copiedId,
  onCopyInvoice,
  onOpenVerify,
  onOpenDetail,
}) {
  return (
    <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
      {/* Invoice */}
      <TableCell className="w-[170px] text-sm py-3 align-middle">
        <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
          <span className="font-medium text-slate-900 truncate block select-all">
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
              <span className="text-xs text-slate-500 block truncate font-normal">
                {maskEmail(item.donorEmail)}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Program */}
      <TableCell className="text-sm text-slate-700 py-3 align-middle">
        <span className="line-clamp-2 leading-snug font-normal text-slate-800 block">
          {item.campaignTitle}
        </span>
      </TableCell>

      {/* Nominal */}
      <TableCell className="w-px text-right font-medium text-sm text-slate-900 py-3 whitespace-nowrap align-middle tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* Metode */}
      <TableCell className="w-px text-center py-3 whitespace-nowrap uppercase align-middle">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 max-w-[110px] truncate whitespace-nowrap">
          {item.paymentChannel}
        </span>
      </TableCell>

      {/* Tanggal */}
      <TableCell className="w-px text-sm text-slate-500 py-3 whitespace-nowrap align-middle text-center tabular-nums">
        {formatDate(item.createdAt)}
      </TableCell>

      {/* Status */}
      <TableCell className="w-px text-center py-3 whitespace-nowrap align-middle">
        <StatusBadge status={item.status} />
      </TableCell>

      {/* Aksi: Verifikasi + Rincian */}
      <TableCell className="w-24 text-right py-3 whitespace-nowrap align-middle pr-4">
        <TableRowActions
          onView={() => onOpenDetail(item)}
          viewTooltip={`Lihat rincian: ${item.invoiceId}`}
        >
          {item.status === "PENDING" && (
            <button
              type="button"
              onClick={() => onOpenVerify(item)}
              aria-label={`Verifikasi donasi: ${item.invoiceId}`}
              className="p-1.5 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </TableRowActions>
      </TableCell>
    </TableRow>
  );
}
