"use client";

import { MoreVertical, Edit3, KeyRound, UserX, UserCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { USER_ROLES } from "@/services/authService";

export function AdminUserActionMenu({
  user,
  currentUser,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) {
  const isSelf = currentUser?.id === user.id;
  const isSuperAdmin = user.role === USER_ROLES.SUPER_ADMIN;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon" aria-label="Aksi pengurus"
          aria-label={`Menu aksi ${user.name}`}
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-white border border-slate-200 shadow-md rounded-lg p-1 z-50">
        <DropdownMenuItem
          onClick={() => onEdit(user)}
          className="cursor-pointer text-sm font-normal text-slate-800 hover:bg-slate-100 py-2 px-2.5 rounded-md flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4 text-slate-500" />
          <span>Ubah profil & peran</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onResetPassword(user)}
          className="cursor-pointer text-sm font-normal text-slate-800 hover:bg-slate-100 py-2 px-2.5 rounded-md flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-slate-500" />
          <span>Reset kata sandi</span>
        </DropdownMenuItem>

        {!isSelf && (
          <>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem
              onClick={() => onToggleStatus(user)}
              className="cursor-pointer text-sm font-normal text-slate-800 hover:bg-slate-100 py-2 px-2.5 rounded-md flex items-center gap-2"
            >
              {user.isActive ? (
                <>
                  <UserX className="w-4 h-4 text-amber-600" />
                  <span>Tangguhkan akun</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Aktifkan akun</span>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="cursor-pointer text-sm font-normal text-rose-600 hover:bg-rose-50 py-2 px-2.5 rounded-md flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Hapus akun</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
