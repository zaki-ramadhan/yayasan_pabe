"use client";

import Link from "next/link";
import { formatRupiah, formatDate, getInitials } from "@/lib/formatters";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function DonorTransactionTableRow({ item }) {
  return (
    <TableRow>
      <TableCell className="text-center text-slate-700 font-normal align-middle">
        {item.no}
      </TableCell>
      <TableCell className="font-medium text-slate-900 align-middle">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-7 h-7 rounded-full border border-slate-200 shrink-0 bg-slate-100">
            {item.donorAvatar && <AvatarImage src={item.donorAvatar} alt={item.donorName} />}
            <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
              {getInitials(item.donorName, "D")}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{item.donorName}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium text-emerald-800 align-middle">
        {formatRupiah(item.amount)}
      </TableCell>
      <TableCell className="font-normal text-slate-800 max-w-xs align-middle">
        {item.campaignSlug ? (
          <Link
            href={`/program/${item.campaignSlug}`}
            className="hover:text-primary transition-colors line-clamp-1"
          >
            {item.programTitle}
          </Link>
        ) : (
          <span className="line-clamp-1">{item.programTitle}</span>
        )}
      </TableCell>
      <TableCell className="font-normal text-slate-800 whitespace-nowrap align-middle">
        <span className="inline-block max-w-[120px] truncate whitespace-nowrap">
          {item.paymentChannel?.replace("_", " ")}
        </span>
      </TableCell>
      <TableCell className="font-normal text-slate-800 whitespace-nowrap align-middle">
        {formatDate(item.date)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap align-middle">
        <Link href={`/invoice/${item.invoiceId}`} target="_blank">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 rounded-md text-sm font-medium border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 cursor-pointer"
          >
            Kuitansi
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
