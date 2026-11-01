"use client";

import { formatRupiah, formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { UserAvatar } from "@/components/ui/Avatar";
import { AdminRoutineDonationStatusBadge } from "./AdminRoutineDonationStatusBadge";

export function AdminRoutineDonationTableRow({ item, onViewDetail }) {
  const getFrequencyText = (r) => {
    if (r.frequency === "DAILY") return "Setiap hari";
    if (r.frequency === "WEEKLY") return `Setiap ${r.selectedDay || "pekan"}`;
    if (r.frequency === "MONTHLY") return "Setiap bulan";
    return r.frequency;
  };

  return (
    <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
      {/* 1. Donatur (Avatar, Nama & Email) */}
      <TableCell className="w-[260px] py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            src={item.donorAvatar}
            name={item.donorName}
            fallback="D"
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

      {/* 2. No. Telepon (Kolom Mandiri & Disensor) */}
      <TableCell className="w-44 py-3 text-sm text-slate-700 align-middle text-center whitespace-nowrap">
        {item.donorPhone ? (
          <span className="font-normal tabular-nums">{maskPhone(item.donorPhone)}</span>
        ) : (
          <span className="text-sm text-slate-400 italic font-normal">-</span>
        )}
      </TableCell>

      {/* Program Kebaikan */}
      <TableCell className="text-sm text-slate-800 py-3 align-middle min-w-[280px] max-w-[360px]">
        <span
          className="font-medium leading-snug line-clamp-2 overflow-hidden"
          title={item.programTitle}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {decodeHtmlEntities(item.programTitle)}
        </span>
        <span className="text-xs text-slate-500 font-normal block mt-0.5">
          Didaftarkan {formatDate(item.createdAt)}
        </span>
      </TableCell>

      {/* Komitmen Nominal */}
      <TableCell className="w-36 text-sm font-medium text-slate-900 py-3 align-middle whitespace-nowrap text-right tabular-nums">
        {formatRupiah(item.amount)}
      </TableCell>

      {/* Frekuensi & Jadwal */}
      <TableCell className="w-40 text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
        <div className="space-y-0.5">
          <span className="font-medium text-slate-900 block leading-tight">
            {getFrequencyText(item)}
          </span>
          <span className="text-xs text-slate-500 font-normal block">
            Pukul {item.reminderTime} WIB
          </span>
        </div>
      </TableCell>

      {/* Tipe Komitmen */}
      <TableCell className="w-36 text-sm text-slate-600 py-3 align-middle whitespace-nowrap font-normal">
        {item.routineType === "AUTO_DONATION" ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 whitespace-nowrap truncate max-w-[120px]"
            title="Auto debet"
          >
            Auto debet
          </span>
        ) : (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/60 whitespace-nowrap truncate max-w-[120px]"
            title="Pengingat"
          >
            Pengingat
          </span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell className="w-28 text-center py-3 align-middle whitespace-nowrap">
        <AdminRoutineDonationStatusBadge status={item.status} />
      </TableCell>

      {/* Aksi */}
      <TableCell className="w-24 text-right py-3 align-middle whitespace-nowrap pr-4">
        <TableRowActions
          onView={() => onViewDetail(item)}
          viewTooltip="Lihat rincian komitmen donasi rutin"
        />
      </TableCell>
    </TableRow>
  );
}
