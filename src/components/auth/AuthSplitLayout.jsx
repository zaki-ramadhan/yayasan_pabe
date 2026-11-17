"use client";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";

export function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      <AuthVisualPanel />

      <div className="flex flex-col justify-center min-h-screen p-6 sm:p-10 lg:p-12 xl:p-16 bg-white overflow-y-auto">
        <AuthMobileHeader />

        <div className="w-full max-w-md mx-auto my-auto py-2">
          {children}
        </div>

        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-slate-500 lg:hidden">
          © {new Date().getFullYear()} Yayasan PABE
        </div>
      </div>
    </div>
  );
}
