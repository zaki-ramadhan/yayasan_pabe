"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldUserIcon } from "@solar-icons/react/line-duotone/shield-user";
import { Widget2Icon } from "@solar-icons/react/line-duotone/widget-2";
import { BillListIcon } from "@solar-icons/react/line-duotone/bill-list";
import { UserIdIcon } from "@solar-icons/react/line-duotone/user-id";
import { CaseRoundIcon } from "@solar-icons/react/line-duotone/case-round";
import { UserRoundedIcon } from "@solar-icons/react/line-duotone/user-rounded";
import { Logout2Icon } from "@solar-icons/react/line-duotone/logout-2";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { NavLoginButton } from "./NavLoginButton";
import { UserAvatarChipTrigger } from "./UserAvatarChipTrigger";
import { USER_ROLES } from "@/services/authService";

export function NavUserDropdown({ currentUser, onLogout, pathname }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) {
    return <NavLoginButton pathname={pathname} />;
  }

  const isDonor = currentUser.role === USER_ROLES.DONOR;
  const isStaff = !isDonor;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <UserAvatarChipTrigger
          currentUser={currentUser}
          isOpen={isOpen}
          ariaLabel="Buka menu profil pengguna"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 sm:w-72 max-h-[85vh] overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg space-y-0.5 z-50"
      >
        <div className="px-2.5 py-2">
          <p className="font-medium text-sm text-slate-950 truncate leading-tight">
            {currentUser.name}
          </p>
          {currentUser.email && (
            <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
              {currentUser.email}
            </p>
          )}
        </div>

        <DropdownMenuSeparator className="my-1 border-slate-100" />

        {isStaff ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <ShieldUserIcon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Panel Admin</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/donatur/dashboard"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Widget2Icon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/riwayat"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <BillListIcon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Riwayat Donasi</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/relawan"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <UserIdIcon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Kartu Relawan</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/karier"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <CaseRoundIcon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Status Lamaran</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/profil"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <UserRoundedIcon className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                <span className="flex-1">Profil Saya</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-1 border-slate-100" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer focus:bg-rose-50 focus:text-rose-700 transition-colors"
        >
          <Logout2Icon className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <span>Keluar dari akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
