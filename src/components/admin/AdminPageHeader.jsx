import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Header judul halaman Admin terstandarisasi untuk konsistensi tipografi, spasi, dan aksi.
 * Single Source of Truth untuk layout header halaman di seluruh Admin Panel.
 */
export function AdminPageHeader({
  title,
  description,
  badge,
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm font-normal text-slate-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
