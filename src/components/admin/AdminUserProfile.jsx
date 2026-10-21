"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DEMO_USERS, ROLE_LABELS, USER_ROLES } from "@/services/authService";

/**
 * Admin user profile badge with role switcher dropdown
 * @param {object} props
 * @param {object} props.currentUser
 * @param {Function} props.onRoleSwitch
 */
export function AdminUserProfile({ currentUser, onRoleSwitch }) {
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center gap-3">
        {currentUser?.avatar ? (
          <Image
            src={currentUser.avatar}
            alt={currentUser.name || "User"}
            width={36}
            height={36}
            unoptimized
            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary text-white text-xs font-normal flex items-center justify-center shrink-0">
            {currentUser?.initials || "U"}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-xs font-normal text-white block truncate">
            {currentUser?.name || "Pengguna"}
          </span>
          <span className="text-[10px] text-primary-light font-normal block truncate">
            {ROLE_LABELS[userRole] || userRole}
          </span>
        </div>
      </div>

      {/* Quick Switch Role Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full mt-1 flex items-center justify-between py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-[11px] text-slate-300 font-normal transition-colors cursor-pointer outline-none">
          <span>Ganti Peran / Role</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 p-1.5">
          <DropdownMenuLabel className="text-[10px] text-slate-500 uppercase font-normal">
            Simulasi Akun Demo
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DEMO_USERS.map((u) => (
            <DropdownMenuItem
              key={u.id}
              onClick={() => onRoleSwitch(u)}
              className="flex flex-col items-start py-1.5 px-2.5 text-xs font-normal cursor-pointer"
            >
              <span className="font-normal text-slate-900">{u.name}</span>
              <span className="text-[10px] text-slate-500">{ROLE_LABELS[u.role]}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
