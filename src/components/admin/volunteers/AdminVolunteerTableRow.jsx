"use client";

import { MapPin, QrCode } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";
import { UserAvatar } from "@/components/ui/Avatar";
import { maskEmail, maskPhone } from "@/lib/security";

export function AdminVolunteerTableRow({
  item,
  isSelected = false,
  onToggleSelect,
  onViewDetail,
  onPrintCard,
  onDelete,
}) {
  return (
    <TableRow
      className={`hover:bg-slate-50/70 transition-colors ${
        isSelected ? "bg-emerald-50/60 hover:bg-emerald-50/80" : ""
      }`}
    >
      {/* 0. Selection Checkbox */}
      <TableCell className="w-12 text-center py-3 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(item.id)}
          aria-label={`Pilih relawan: ${item.fullName}`}
        />
      </TableCell>

      {/* Nama & Kontak */}
      <TableCell className="w-64 py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            src={item.avatar}
            name={item.fullName}
            fallback="R"
          />
          <div className="min-w-0 space-y-0.5">
            <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
              {item.fullName}
            </span>
            <div className="flex flex-col text-sm text-slate-500 font-normal truncate">
              {item.email && <span>{maskEmail(item.email)}</span>}
              {item.phone && <span>{maskPhone(item.phone)}</span>}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Domisili */}
      <TableCell className="w-36 text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
        <span className="inline-flex items-center gap-1 font-normal">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.city}</span>
        </span>
      </TableCell>

      {/* Bidang Minat */}
      <TableCell className="text-sm text-slate-800 py-3 align-middle">
        <span className="font-medium block leading-snug line-clamp-1">
          {item.interest}
        </span>
        {item.motivation && (
          <p className="text-sm text-slate-500 line-clamp-1 font-normal mt-0.5">
            {item.motivation}
          </p>
        )}
      </TableCell>

      {/* Tanggal Daftar */}
      <TableCell className="w-36 text-sm text-slate-500 py-3 whitespace-nowrap align-middle">
        {formatDate(item.createdAt)}
      </TableCell>

      {/* Status */}
      <TableCell className="w-32 text-center py-3 whitespace-nowrap align-middle">
        <AdminVolunteerStatusBadge status={item.status} />
      </TableCell>

      {/* Aksi */}
      <TableCell className="w-24 text-right py-3 whitespace-nowrap align-middle pr-4">
        <TableRowActions
          onView={() => onViewDetail(item)}
          onDelete={() => onDelete(item.id, item.fullName)}
          viewTooltip="Lihat rincian pendaftar"
          deleteTooltip="Hapus berkas pendaftar"
        >
          {item.status === "APPROVED" && onPrintCard && (
            <button
              type="button"
              onClick={() => onPrintCard(item)} aria-label="Cetak kartu tanda anggota"
              aria-label="Cetak kartu tanda anggota"
              className="p-1.5 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
        </TableRowActions>
      </TableCell>
    </TableRow>
  );
}
