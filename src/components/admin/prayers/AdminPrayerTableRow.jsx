"use client";

import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Heart } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRupiah, getInitials } from "@/lib/formatters";

export function AdminPrayerTableRow({
  item,
  onToggleHide,
}) {
  return (
    <TableRow
      key={item.id}
      className={`hover:bg-slate-50/70 transition-colors ${
        item.isPrayerHidden ? "bg-slate-50/60 opacity-80" : ""
      }`}
    >
      {/* 1. Donatur */}
      <TableCell className="w-48 py-3 align-top">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-100">
            {item.donorAvatar && <AvatarImage src={item.donorAvatar} alt={item.donorName} />}
            <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
              {item.isAnonymous ? "HA" : getInitials(item.donorName, "D")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
              {item.donorName}
            </span>
            {item.isAnonymous ? (
              <span className="text-xs font-normal text-slate-400 block">
                (Anonim)
              </span>
            ) : item.donorEmail ? (
              <span className="text-xs font-normal text-slate-500 block truncate">
                {item.donorEmail}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* 2. Program Donasi */}
      <TableCell className="w-48 py-3 align-top">
        <div className="space-y-1">
          <span className="font-medium text-sm text-slate-900 block leading-snug line-clamp-2">
            {item.campaignTitle}
          </span>
          {item.campaignSlug && (
            <Link
              href={`/campaign/${item.campaignSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-normal"
            >
              <span>Lihat program</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </TableCell>

      {/* 3. Nominal Donasi */}
      <TableCell className="w-32 py-3 align-top whitespace-nowrap text-sm font-medium text-slate-800">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* 4. No. Invoice */}
      <TableCell className="w-32 py-3 align-top whitespace-nowrap text-xs font-mono text-slate-500">
        {item.invoiceId}
      </TableCell>

      {/* 4. Pesan Doa */}
      <TableCell className="min-w-[220px] py-3 align-top space-y-1.5">
        <p className="text-sm font-normal text-slate-800 leading-relaxed italic">
          &ldquo;{item.prayer}&rdquo;
        </p>
        {item.aminCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-normal">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>{item.aminCount} orang mengaminkan</span>
          </span>
        )}
      </TableCell>

      {/* 5. Waktu Kirim */}
      <TableCell className="w-36 py-3 align-top whitespace-nowrap text-xs text-slate-500 font-normal">
        {formatDate(item.createdAt, { withTime: true })}
      </TableCell>

      {/* 6. Status Moderasi */}
      <TableCell className="w-32 text-center py-3 align-top whitespace-nowrap">
        {item.isPrayerHidden ? (
          <Badge variant="danger" className="gap-1">
            <EyeOff className="w-3 h-3 text-rose-600" />
            <span>Disembunyikan</span>
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1">
            <Eye className="w-3 h-3 text-emerald-600" />
            <span>Ditampilkan</span>
          </Badge>
        )}
      </TableCell>

      {/* 7. Aksi Moderasi */}
      <TableCell className="w-24 text-right py-3 align-top pr-4 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {/* Tombol Sembunyikan/Tampilkan Doa */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleHide(item)}
            title={item.isPrayerHidden ? "Tampilkan kembali ke publik" : "Sembunyikan dari feed publik"}
            className={`h-8 w-8 p-0 cursor-pointer ${
              item.isPrayerHidden
                ? "text-rose-700 bg-rose-100/70 hover:bg-rose-200/70"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {item.isPrayerHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
