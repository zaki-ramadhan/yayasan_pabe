"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Heart, Copy, Check, Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { UserAvatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatRupiah, formatClockTime } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";

export function AdminPrayerTableRow({
  item,
  isSelected = false,
  onToggleSelect,
  isToggling = false,
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
        isSelected
          ? "bg-primary/5 hover:bg-primary/10"
          : item.isPrayerHidden
          ? "bg-slate-50/60 opacity-80"
          : ""
      }`}
    >
      {/* 0. Checkbox Selection */}
      <TableCell className="w-12 text-center py-3 align-top" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(item.id)}
          aria-label={`Pilih doa dari ${item.donorName}`}
        />
      </TableCell>
      {/* 1. No. Invoice (Persis gaya & posisi seperti Mutasi Transaksi) */}
      <TableCell className="w-[170px] text-sm py-3 align-top">
        <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
          <span
            className="font-normal font-mono text-slate-700 truncate block select-all"
          >
            {item.invoiceId}
          </span>
          <button
            type="button"
            onClick={() => handleCopyInvoice(item.invoiceId)}
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
            {item.isAnonymous ? (
              <span className="text-sm font-normal text-slate-400 block">
                (Anonim)
              </span>
            ) : item.donorEmail ? (
              <span className="text-sm font-normal text-slate-500 block truncate">
                {maskEmail(item.donorEmail)}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* 3. Program Donasi */}
      <TableCell className="min-w-[240px] max-w-[340px] py-3 align-top">
        {item.campaignSlug ? (
          <Link
            href={`/campaign/${item.campaignSlug}`}
            target="_blank"
            className="font-normal text-sm text-slate-800 hover:text-primary hover:underline leading-snug line-clamp-2 cursor-pointer transition-colors block overflow-hidden"
            aria-label={`Buka program: ${item.campaignTitle}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.campaignTitle}
          </Link>
        ) : (
          <span
            className="font-normal text-sm text-slate-800 leading-snug line-clamp-2 block overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.campaignTitle}
          </span>
        )}
      </TableCell>

      {/* 4. Nominal Donasi */}
      <TableCell className="w-32 py-3 align-top whitespace-nowrap text-sm font-normal text-slate-700 text-right tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* 5. Pesan Doa (line-clamp-2) */}
      <TableCell className="min-w-[240px] max-w-md py-3 align-top space-y-1.5">
        <p className="text-sm font-normal text-slate-800 leading-relaxed italic line-clamp-2">
          &ldquo;{item.prayer}&rdquo;
        </p>
        {item.aminCount > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-rose-600 font-normal">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{item.aminCount} orang mengaminkan</span>
          </span>
        )}
      </TableCell>

      {/* 6. Waktu Kirim (Dua baris tanggal & jam, teks jelas) */}
      <TableCell className="w-36 py-3 align-top whitespace-nowrap text-sm text-slate-700 font-normal text-center tabular-nums">
        <div className="space-y-0.5">
          <span className="font-normal text-slate-700 block leading-tight">
            {formatDate(item.createdAt)}
          </span>
          <span className="text-sm text-slate-500 block">
            {formatClockTime(item.createdAt)} WIB
          </span>
        </div>
      </TableCell>

      {/* 7. Status Moderasi (Badge) */}
      <TableCell className="w-32 text-center py-3 align-top whitespace-nowrap">
        {item.isPrayerHidden ? (
          <Badge variant="danger" className="gap-1 max-w-[140px]" title="Disembunyikan">
            <EyeOff className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="truncate">Disembunyikan</span>
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1 max-w-[140px]" title="Ditampilkan">
            <Eye className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Ditampilkan</span>
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
            disabled={isToggling}
            onClick={() => onToggleHide(item)} aria-label={item.isPrayerHidden ? "Tampilkan kembali ke publik" : "Sembunyikan dari feed publik"}
            className={`h-8 w-8 p-0 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed ${
              item.isPrayerHidden
                ? "text-rose-700 bg-rose-100/70 hover:bg-rose-200/70"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : item.isPrayerHidden ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
