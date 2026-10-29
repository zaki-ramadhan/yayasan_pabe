"use client";

import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { UserAvatar } from "@/components/ui/Avatar";
import { maskEmail, maskPhone } from "@/lib/security";

export function AdminDonorTableRow({ donor, onOpenDetail }) {
  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      {/* 1. Donatur (Avatar, Nama & Email) */}
      <TableCell className="w-[260px] py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            src={donor.avatar}
            name={donor.name}
            fallback="D"
            isAnonymous={donor.name === "Hamba Allah"}
          />
          <div className="min-w-0 space-y-0.5">
            <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
              {donor.name}
            </span>
            {donor.email && (
              <span className="text-sm text-slate-500 block truncate font-normal">
                {maskEmail(donor.email)}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* 2. No. Telepon (Kolom Mandiri & Disensor) */}
      <TableCell className="w-44 py-3 text-sm text-slate-700 align-middle whitespace-nowrap">
        {donor.phone ? (
          <span className="font-normal tabular-nums">{maskPhone(donor.phone)}</span>
        ) : (
          <span className="text-sm text-slate-400 italic font-normal">-</span>
        )}
      </TableCell>

      {/* 3. Total Donasi */}
      <TableCell className="w-px font-medium text-sm text-slate-900 py-3 whitespace-nowrap align-middle">
        {formatRupiah(donor.totalPaidAmount)}
      </TableCell>

      {/* 4. Frekuensi Donasi */}
      <TableCell className="w-px text-center text-sm font-normal text-slate-700 py-3 whitespace-nowrap align-middle">
        {donor.paidCount}x
      </TableCell>

      {/* 5. Donasi Terakhir */}
      <TableCell className="w-px text-sm text-slate-500 py-3 whitespace-nowrap align-middle">
        {donor.lastDonatedAt ? formatDate(donor.lastDonatedAt) : "-"}
      </TableCell>

      {/* 6. Aksi (Hanya Rincian) */}
      <TableCell className="w-20 text-right py-3 whitespace-nowrap align-middle pr-4">
        <TableRowActions
          onView={() => onOpenDetail(donor)}
          viewTooltip={`Lihat rincian: ${donor.name}`}
        />
      </TableCell>
    </TableRow>
  );
}
