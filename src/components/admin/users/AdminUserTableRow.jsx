"use client";

import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/Table";
import { AdminUserActionMenu } from "./AdminUserActionMenu";
import { formatPhoneNumber } from "@/lib/userParser";
import { maskPhone } from "@/lib/security";
import { getInitials, formatDate } from "@/lib/formatters";
import { resolveStaffAvatar } from "@/constants/staffConstants";
import { USER_ROLES } from "@/services/authService";

export function AdminUserTableRow({
  user,
  currentUser,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) {
  const isSelf = currentUser?.id === user.id;
  const avatarUrl = resolveStaffAvatar(user.avatar, user.gender);

  // Privasi Kontak Pengurus: Nomor telepon selalu disensor di tabel umum untuk mencegah intipan layar
  const displayPhone = user.phone ? maskPhone(user.phone) : "-";

  return (
    <TableRow key={user.id} className="hover:bg-slate-50/70 transition-colors">
      {/* 1. Identitas Pengurus (Avatar, Nama, Email, Tag Status) */}
      <TableCell className="py-3 px-4 w-64 max-w-xs align-middle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-xs font-medium text-slate-600">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={user.name}
                width={32}
                height={32}
                unoptimized={typeof avatarUrl === "string" && !avatarUrl.startsWith("/") && !avatarUrl.includes("lh3.googleusercontent.com")}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(user.name, "P")}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium text-slate-900 leading-tight line-clamp-2 break-words">
                {user.name}
              </span>
              {isSelf && (
                <span
                  title="Anda"
                  className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0 max-w-[80px] truncate whitespace-nowrap"
                >
                  Anda
                </span>
              )}
              {!user.isActive && (
                <span
                  title="Ditangguhkan"
                  className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded shrink-0 max-w-[130px] truncate whitespace-nowrap"
                >
                  Ditangguhkan
                </span>
              )}
            </div>
            {user.email?.endsWith("@internal.yayasanpayungberkah.org") ? (
              <span className="text-sm text-slate-400 block truncate font-normal italic">
                Tanpa akses login
              </span>
            ) : (
              <span className="text-sm text-slate-500 block line-clamp-2 break-all font-normal">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* 2. Kontak (Centered) */}
      <TableCell className="py-3 px-4 w-36 max-w-[150px] text-center align-middle">
        <span className="text-sm font-normal text-slate-700 tabular-nums line-clamp-2 break-all block">
          {displayPhone}
        </span>
      </TableCell>

      {/* 3. Jabatan & Akses */}
      <TableCell className="py-3 px-4 w-56 max-w-xs align-middle">
        <div className="space-y-1">
          <span className="text-sm font-normal text-slate-700 leading-snug line-clamp-2 break-words block">
            {user.title || "-"}
          </span>
          {user.role === USER_ROLES.SUPER_ADMIN ? (
            <span
              title="Super admin"
              className="inline-flex items-center text-sm font-normal text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md shrink-0 max-w-[140px] truncate whitespace-nowrap"
            >
              Super admin
            </span>
          ) : user.hasLoginAccess ? (
            <span
              title="Admin"
              className="inline-flex items-center text-sm font-normal text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md shrink-0 max-w-[140px] truncate whitespace-nowrap"
            >
              Admin
            </span>
          ) : null}
        </div>
      </TableCell>

      {/* 4. Terdaftar */}
      <TableCell className="py-3 px-4 w-36 max-w-[150px] text-center align-middle">
        <span className="text-sm font-normal text-slate-700 tabular-nums line-clamp-2 block">
          {user.createdAt ? formatDate(user.createdAt) : "-"}
        </span>
      </TableCell>

      {/* 5. Aksi */}
      <TableCell className="py-3 px-4 text-right align-middle w-20 max-w-[100px]">
        <AdminUserActionMenu
          user={user}
          currentUser={currentUser}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
