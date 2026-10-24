"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Heart, Copy, Check } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRupiah, getInitials } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/use-toast";

export function AdminPrayerTableRow({
  item,
  onToggleHide,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    const success = await copyToClipboard(invoiceId);
    if (success) {
      setCopied(true);
      toast.success(`Nomor invoice ${invoiceId} berhasil disalin.`);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin nomor invoice.");
    }
  };

  return (
    <TableRow
      key={item.id}
      className={`hover:bg-slate-50/70 transition-colors ${
        item.isPrayerHidden ? "bg-slate-50/60 opacity-80" : ""
      }`}
    >
      {/* 1. No. Invoice (Persis gaya & posisi seperti Mutasi Transaksi) */}
      <TableCell className="w-[170px] text-sm py-3 align-top">
        <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
          <span
            className="font-medium text-slate-900 truncate block select-all"
            title={item.invoiceId}
          >
            {item.invoiceId}
          </span>
          <button
            type="button"
            onClick={() => handleCopyInvoice(item.invoiceId)}
            title="Salin nomor invoice"
            aria-label={`Salin invoice ${item.invoiceId}`}
            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </TableCell>

      {/* 2. Donatur (Email disensor & ukuran teks minimal sm) */}
      <TableCell className="w-52 py-3 align-top">
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
              <span className="text-sm font-normal text-slate-400 block">
                (Anonim)
              </span>
            ) : item.donorEmail ? (
              <span className="text-sm font-normal text-slate-500 block truncate" title={item.donorEmail}>
                {maskEmail(item.donorEmail)}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* 3. Program Donasi (Lebar lega dengan line-clamp-2) */}
      <TableCell className="min-w-[280px] max-w-[360px] py-3 align-top">
        <div className="space-y-1">
          <span
            className="font-medium text-sm text-slate-900 block leading-snug line-clamp-2"
            title={item.campaignTitle}
          >
            {item.campaignTitle}
          </span>
          {item.campaignSlug && (
            <Link
              href={`/campaign/${item.campaignSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-normal"
            >
              <span>Lihat program</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </TableCell>

      {/* 4. Nominal Donasi */}
      <TableCell className="w-32 py-3 align-top whitespace-nowrap text-sm font-medium text-slate-900">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* 5. Pesan Doa (Lega dengan line-clamp-3) */}
      <TableCell className="min-w-[240px] max-w-md py-3 align-top space-y-1.5">
        <p
          className="text-sm font-normal text-slate-800 leading-relaxed italic line-clamp-3"
          title={item.prayer}
        >
          &ldquo;{item.prayer}&rdquo;
        </p>
        {item.aminCount > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-rose-600 font-normal">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{item.aminCount} orang mengaminkan</span>
          </span>
        )}
      </TableCell>

      {/* 6. Waktu Kirim (Ukuran sm bukan xs) */}
      <TableCell className="w-36 py-3 align-top whitespace-nowrap text-sm text-slate-500 font-normal">
        {formatDate(item.createdAt, { withTime: true })}
      </TableCell>

      {/* 7. Status Moderasi (Badge) */}
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

      {/* 8. Aksi Moderasi */}
      <TableCell className="w-24 text-right py-3 align-top pr-4 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
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
