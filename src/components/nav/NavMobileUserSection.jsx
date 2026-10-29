"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NavMobileUserSection({ currentUser, onClose, onLogout }) {
  return (
    <div className="pt-3 border-t border-slate-200">
      {currentUser ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center">
              {currentUser.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name || "User Avatar"}
                  width={40}
                  height={40}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-medium text-sm text-white">
                  {currentUser.initials || "U"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="block text-sm font-medium text-slate-900 truncate"
                title={currentUser.name}
              >
                {currentUser.name}
              </span>
              <span className="block text-xs text-slate-500 truncate font-mono">
                {currentUser.email || "Donatur Terdaftar"}
              </span>
            </div>
          </div>

          {currentUser.role !== "DONOR" && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-lg font-medium bg-slate-900 text-white text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Portal Administrator Yayasan</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full h-10 rounded-lg font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <span>Keluar (Logout)</span>
          </button>
        </div>
      ) : (
        <Link href="/login" onClick={onClose} className="w-full block">
          <Button className="w-full h-10 rounded-lg font-medium bg-slate-900 hover:bg-slate-800 text-white justify-center text-sm shadow-2xs cursor-pointer flex items-center gap-2">
            <User className="w-4 h-4 text-white" />
            <span>Masuk / Login Akun</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
