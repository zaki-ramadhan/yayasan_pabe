"use client";

import { cn } from "@/lib/utils";

export const PROFILE_TABS = [
  {
    id: "personal",
    label: "Data Pribadi",
  },
  {
    id: "bank",
    label: "Rekening Bank",
  },
  {
    id: "security",
    label: "Keamanan Akun",
  },
];

export function DonorProfileNav({
  activeTab = "personal",
  onSelectTab,
  className,
}) {
  return (
    <nav
      aria-label="Navigasi Pengaturan Akun"
      className={cn(
        "flex flex-row md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 select-none",
        className
      )}
    >
      {PROFILE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              "w-full text-left px-3.5 py-2.5 rounded-md text-sm transition-colors whitespace-nowrap cursor-pointer",
              isActive
                ? "bg-white text-slate-950 font-medium shadow-2xs border border-slate-200/90"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60 font-normal"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
