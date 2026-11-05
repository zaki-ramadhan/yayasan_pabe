"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { formatRupiah, formatDate, formatTime, formatPaymentChannel } from "@/lib/formatters";
import { TableRow, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/Avatar";

export function DonorTransactionTableRow({ item }) {
  return (
    <TableRow>
      <TableCell className="text-center text-slate-700 font-normal align-middle">
        {item.no}
      </TableCell>
      <TableCell className="font-medium text-slate-900 align-middle">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            src={item.donorAvatar}
            name={item.donorName}
            fallback="D"
            className="w-7 h-7"
          />
          <span className="truncate">{item.donorName}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium text-emerald-800 align-middle tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>
      <TableCell className="font-normal text-slate-800 max-w-xs align-middle">
        {item.campaignSlug ? (
          <Link
            href={`/campaign/${item.campaignSlug}`}
            className="hover:text-primary transition-colors line-clamp-1"
          >
            {item.programTitle}
          </Link>
        ) : (
          <span className="line-clamp-1">{item.programTitle}</span>
        )}
      </TableCell>
      <TableCell className="font-normal text-slate-800 whitespace-nowrap align-middle text-center">
        <span className="inline-block max-w-[140px] truncate whitespace-nowrap">
          {formatPaymentChannel(item.paymentChannel)}
        </span>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle">
        <StatusBadge status={item.status || "PAID"} />
      </TableCell>
      <TableCell
        className="whitespace-nowrap align-middle text-center"
        title={formatDate(item.date, { withTime: true, withSeconds: true })}
      >
        <div className="flex flex-col items-center leading-tight">
          <span className="font-medium text-slate-900 text-xs sm:text-sm">
            {formatDate(item.date)}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 tabular-nums mt-0.5">
            {formatTime(item.date)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle">
        {item.status === "EXPIRED" ? (
          <Link
            href={
              item.campaignSlug
                ? `/campaign/${item.campaignSlug}/donate?amount=${item.amount}`
                : "/program"
            }
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            title="Donasi lagi untuk program ini"
          >
            Donasi lagi
          </Link>
        ) : item.status === "PENDING" ? (
          <Link
            href={`/invoice/${item.invoiceId}`}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Bayar
          </Link>
        ) : (
          <Link
            href={`/invoice/${item.invoiceId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            title="Cek kuitansi pembayaran resmi"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Cek kuitansi</span>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}
