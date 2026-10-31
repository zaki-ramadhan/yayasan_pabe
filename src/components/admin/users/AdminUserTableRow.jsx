"use client";

import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/Table";
import { AdminUserRoleBadge, AdminUserStatusBadge } from "./AdminUserStatusBadge";
import { AdminUserActionMenu } from "./AdminUserActionMenu";
import { formatPhoneNumber } from "@/lib/userParser";
import { getInitials, formatDate } from "@/lib/formatters";

export function AdminUserTableRow({
  user,
  currentUser,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) {
  const isSelf = currentUser?.id === user.id;

  return (
    <TableRow key={user.id} className="hover:bg-slate-50/70 transition-colors">
      {/* 1. Identitas Pengurus (Avatar, Nama, Email) */}
      <TableCell className="py-3 px-4 w-56 align-middle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-xs font-medium text-slate-600">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                unoptimized={typeof user.avatar === "string" && !user.avatar.startsWith("/") && !user.avatar.includes("lh3.googleusercontent.com")}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(user.name, "P")}</span>
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium text-slate-900 leading-tight truncate">
                {user.name}
              </span>
              {isSelf && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20 shrink-0">
                  Anda
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 block truncate font-normal">
              {user.email}
            </span>
          </div>
        </div>
      </TableCell>

      {/* 2. Kontak */}
      <TableCell className="py-3 px-4 w-40 whitespace-nowrap align-middle">
        <span className="text-sm font-normal text-slate-700 tabular-nums">
          {formatPhoneNumber(user.phone) || "-"}
        </span>
      </TableCell>

      {/* 3. Peran & Jabatan */}
      <TableCell className="py-3 px-4 w-44 whitespace-nowrap align-middle">
        <div className="space-y-0.5">
          <AdminUserRoleBadge role={user.role} />
          {user.title && (
            <span className="text-xs font-normal text-slate-500 block truncate">
              {user.title}
            </span>
          )}
        </div>
      </TableCell>

      {/* 4. Status */}
      <TableCell className="py-3 px-4 w-28 text-center whitespace-nowrap align-middle">
        <AdminUserStatusBadge isActive={user.isActive} />
      </TableCell>

      {/* 5. Terdaftar */}
      <TableCell className="py-3 px-4 w-36 text-center whitespace-nowrap align-middle">
        <span className="text-sm font-normal text-slate-700 tabular-nums">
          {user.createdAt ? formatDate(user.createdAt) : "-"}
        </span>
      </TableCell>

      {/* 6. Aksi */}
      <TableCell className="py-3 px-4 text-right whitespace-nowrap align-middle w-32">
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
