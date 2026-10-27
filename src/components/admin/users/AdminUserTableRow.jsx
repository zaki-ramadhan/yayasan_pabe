"use client";

import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/table";
import { AdminUserRoleBadge, AdminUserStatusBadge } from "./AdminUserStatusBadge";
import { AdminUserActionMenu } from "./AdminUserActionMenu";
import { formatPhoneNumber } from "@/lib/userParser";
import { getInitials } from "@/lib/formatters";

export function AdminUserTableRow({
  user,
  isCurrent,
  currentUser,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) {
  return (
    <TableRow key={user.id} className="hover:bg-slate-50/70 transition-colors">
      {/* Avatar */}
      <TableCell className="py-3 px-4 w-px align-middle">
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
      </TableCell>

      {/* Name & Email */}
      <TableCell className="py-3 px-4 align-middle">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-slate-900 leading-tight">
              {user.name}
            </span>
            {isCurrent && (
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                Anda
              </span>
            )}
          </div>
          <span className="text-sm text-slate-500 block truncate font-normal">
            {user.email}
          </span>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
        <AdminUserRoleBadge role={user.role} />
      </TableCell>

      {/* Structural Title */}
      <TableCell className="py-3 px-4 align-middle">
        <span className="text-sm font-normal text-slate-700 block truncate">
          {user.title || "-"}
        </span>
      </TableCell>

      {/* Phone */}
      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
        <span className="text-sm font-normal text-slate-700 tabular-nums">
          {formatPhoneNumber(user.phone)}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
        <AdminUserStatusBadge isActive={user.isActive} />
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 px-4 text-center whitespace-nowrap align-middle w-px">
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
