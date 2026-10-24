"use client";

import { MapPin } from "lucide-react";
import { formatDate, getInitials } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { maskEmail } from "@/lib/security";

export function AdminVolunteerTableRow({ item, onViewDetail, onDelete }) {
  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      {/* Nama & Kontak */}
      <TableCell className="w-64 py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-100">
            <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
              {getInitials(item.fullName, "R")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
              {item.fullName}
            </span>
            <div className="flex flex-col text-sm text-slate-500 font-normal truncate">
              {item.email && <span>{maskEmail(item.email)}</span>}
              {item.phone && <span>{item.phone}</span>}
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
        <span className="font-medium block leading-snug">
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
        />
      </TableCell>
    </TableRow>
  );
}
