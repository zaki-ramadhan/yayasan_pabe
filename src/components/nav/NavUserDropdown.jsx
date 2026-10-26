"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";
import { cn } from "@/lib/utils";

export function NavUserDropdown({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const avatarUrl = !imgError
    ? (currentUser?.avatar || currentUser?.image || currentUser?.picture || currentUser?.avatarUrl)
    : null;

  const fallbackInitial =
    currentUser?.initials ||
    (currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : "U");

  if (!currentUser) {
    return (
      <Link href="/login">
        <Button
          size="sm"
          variant="outline"
          className="h-8.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-400 cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <User className="w-3.5 h-3.5 text-slate-600" />
          <span>Masuk / Login</span>
        </Button>
      </Link>
    );
  }

  const isDonor = currentUser.role === USER_ROLES.DONOR;
  const isStaff = !isDonor;
  const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role || "Donatur";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger: Active state highlights background, border, avatar ring, and rotates chevron */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-1.5 p-1 pr-1.5 sm:pr-2 rounded-full transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            isOpen
              ? "bg-slate-100 border border-slate-300 shadow-2xs ring-2 ring-primary/15"
              : "bg-transparent hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300"
          )}
          aria-label="Buka menu profil pengguna"
          aria-expanded={isOpen}
        >
          {/* Profile Picture */}
          <div
            className={cn(
              "relative w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center transition-all duration-200",
              isOpen
                ? "border border-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-white shadow-2xs bg-white"
                : "border border-slate-300 bg-slate-100"
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={currentUser.name || "Avatar"}
                fill
                sizes="32px"
                unoptimized={typeof avatarUrl === "string" && !avatarUrl.startsWith("/") && !avatarUrl.includes("lh3.googleusercontent.com")}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-medium text-xs text-slate-800">
                {fallbackInitial}
              </span>
            )}
          </div>

          {/* Small chevron arrow with smooth rotation */}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
              isOpen
                ? "rotate-180 text-primary"
                : "text-slate-500 group-hover:text-slate-800"
            )}
            strokeWidth={2}
          />
        </button>
      </DropdownMenuTrigger>

      {/* Simple Popover Dropdown Menu */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 sm:w-72 p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg space-y-0.5 z-50"
      >
        {/* User Identity Header */}
        <div className="px-2.5 py-2 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
              {currentUser.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name || "Avatar"}
                  fill
                  sizes="32px"
                  unoptimized={typeof currentUser.avatar === "string" && !currentUser.avatar.startsWith("/") && !currentUser.avatar.includes("lh3.googleusercontent.com")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-medium text-sm text-slate-800">
                  {currentUser.initials || "U"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-slate-950 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-sm font-normal text-slate-500 truncate leading-tight">
                {currentUser.email || roleLabel}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 border-slate-100" />

        {/* Navigation Links based on Role */}
        {isStaff ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Panel admin</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/admin/program"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Kelola program</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/admin/transaksi"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Mutasi transaksi</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/donatur/dashboard"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/riwayat"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Riwayat donasi</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/relawan"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Kartu relawan</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/donatur/profil"
                className="px-2.5 py-2 rounded-md text-sm font-normal text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="flex-1">Profil saya</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-1 border-slate-100" />

        {/* Logout Item */}
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-normal text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer focus:bg-rose-50 focus:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Keluar dari akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

