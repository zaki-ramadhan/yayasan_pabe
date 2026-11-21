"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartIcon as Heart } from "@solar-icons/react/line-duotone/heart";
import { CopyIcon as Copy } from "@solar-icons/react/line-duotone/copy";
import { CheckReadIcon as Check } from "@solar-icons/react/line-duotone/check-read";
import { TableCell, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusSelectBadge } from "@/components/ui/StatusSelectBadge";
import { formatDate, formatRupiah, formatClockTime } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { copyToClipboard } from "@/lib/clipboard";
import { getCampaignDetailHref } from "@/lib/zisFilter";
import { toast } from "@/hooks/useToast";

const PRAYER_STATUS_OPTIONS = [
  { value: "VISIBLE", label: "Ditampilkan", color: "emerald" },
  { value: "HIDDEN", label: "Disembunyikan", color: "rose" },
];

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

  const handleStatusChange = (newVal) => {
    const shouldHide = newVal === "HIDDEN";
    if (shouldHide !== Boolean(item.isPrayerHidden)) {
      onToggleHide(item);
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
      <TableCell className="w-12 text-center py-3 align-top" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(item.id)}
          aria-label={`Pilih doa dari ${item.donorName}`}
        />
      </TableCell>
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
              <span className="text-sm font-normal text-slate-500 block">
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

      <TableCell className="min-w-[240px] max-w-[340px] py-3 align-top">
        {item.campaignSlug ? (
          <Link
            href={getCampaignDetailHref(item.campaignSlug)}
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

      <TableCell className="w-32 py-3 align-top whitespace-nowrap text-sm font-normal text-slate-700 text-right tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>

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

      <TableCell className="w-32 text-center py-3 align-top whitespace-nowrap pr-4" onClick={(e) => e.stopPropagation()}>
        <StatusSelectBadge
          value={item.isPrayerHidden ? "HIDDEN" : "VISIBLE"}
          options={PRAYER_STATUS_OPTIONS}
          onChange={handleStatusChange}
          variant="solid"
          size="sm"
          isUpdating={isToggling}
          disabled={isToggling}
          ariaLabel={`Ubah status moderasi doa dari ${item.donorName}`}
        />
      </TableCell>
    </TableRow>
  );
}
