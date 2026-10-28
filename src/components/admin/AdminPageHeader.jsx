import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Header judul halaman Admin terstandarisasi untuk konsistensi tipografi, spasi, dan aksi.
 * Single Source of Truth untuk layout header halaman di seluruh Admin Panel.
 */
export function AdminPageHeader({
  badge,
  action,
  className = "",
}) {
  if (!badge && !action) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 pb-1",
        className
      )}
    >
      {badge && <div>{badge}</div>}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
