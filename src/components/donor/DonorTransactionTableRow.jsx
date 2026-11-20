"use client";

import Link from "next/link";
import { DocumentTextIcon as FileText } from "@solar-icons/react/line-duotone/document-text";
import { formatRupiah, formatDate, formatTime, formatPaymentChannel } from "@/lib/formatters";
import { TableRow, TableCell } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import {
  isZisTransaction,
  getCampaignDetailHref,
  getCampaignDonateHref,
} from "@/lib/zisFilter";

export function DonorTransactionTableRow({ item, showTypeColumn = false }) {
  const isZis = isZisTransaction(item);
  const isRetryableStatus =
    item.status === "EXPIRED" ||
    item.status === "CANCELLED" ||
    item.status === "FAILED";
  const canRetry =
    item.canDonateAgain !== false &&
    (Boolean(item.campaignSlug) ||
      item.donationType === "ZAKAT" ||
      item.donationType === "INFAK_SUBUH");

  const retryHref = item.campaignSlug
    ? `${getCampaignDonateHref({
        slug: item.campaignSlug,
        categorySlug: item.categorySlug,
        categoryName: item.categoryName,
        category: item.campaign?.category || (isZis ? "ZIS" : ""),
      })}?amount=${item.amount}`
    : isZis
    ? `/zakat/bayar?amount=${item.amount}`
    : "/program";

  return (
    <TableRow>
      <TableCell className="font-normal text-slate-800 align-middle max-w-[180px]">
        <span className="truncate block">{item.donorName}</span>
      </TableCell>
      {showTypeColumn && (
        <TableCell className="text-center whitespace-nowrap align-middle">
          <Badge variant="secondary">
            {isZis ? "Zakat" : "Donasi"}
          </Badge>
        </TableCell>
      )}
      <TableCell className="text-right font-medium text-sm text-emerald-800 align-middle tabular-nums whitespace-nowrap min-w-[125px]">
        {formatRupiah(item.amount)}
      </TableCell>
      <TableCell className="text-slate-900 min-w-[210px] max-w-xs align-middle">
        {item.campaignSlug ? (
          <Link
            href={getCampaignDetailHref({
              slug: item.campaignSlug,
              categorySlug: item.categorySlug,
              categoryName: item.categoryName,
              category: item.campaign?.category || (isZis ? "ZIS" : ""),
            })}
            className="font-medium text-slate-900 hover:text-primary transition-colors line-clamp-1"
          >
            {item.programTitle}
          </Link>
        ) : (
          <span className="font-medium text-slate-900 line-clamp-1">{item.programTitle}</span>
        )}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle min-w-[160px]">
        <Badge variant="secondary">
          {formatPaymentChannel(item.paymentChannel)}
        </Badge>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle">
        <StatusBadge status={item.status || "PAID"} />
      </TableCell>
      <TableCell className="whitespace-nowrap align-middle text-center">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm font-medium text-slate-800">
            {formatDate(item.date)}
          </span>
          <span className="text-[12px] font-normal text-slate-500 tabular-nums mt-0.5">
            {formatTime(item.date)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle">
        {isRetryableStatus ? (
          canRetry ? (
            <Link
              href={retryHref}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              aria-label={isZis ? "Tunaikan lagi untuk program ini" : "Donasi lagi untuk program ini"}
            >
              {isZis ? "Tunaikan lagi" : "Donasi lagi"}
            </Link>
          ) : (
            <span className="text-sm font-normal text-slate-500">
              Program ditutup
            </span>
          )
        ) : item.status === "PENDING" ? (
          <Link
            href={`/invoice/${item.invoiceId}${item.accessToken ? `?token=${encodeURIComponent(item.accessToken)}` : ""}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Bayar
          </Link>
        ) : (
          <Link
            href={`/invoice/${item.invoiceId}${item.accessToken ? `?token=${encodeURIComponent(item.accessToken)}` : ""}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            aria-label="Cek kuitansi pembayaran resmi"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Cek kuitansi</span>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}
