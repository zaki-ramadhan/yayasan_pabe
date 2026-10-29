"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Reusable inline quick-edit button for Admin and Super Admin users.
 * Mengadopsi styling tombol CTA standar admin (Button variant default / outline)
 * agar tampilan visual konsisten dengan halaman panel admin.
 *
 * @param {{
 *   href: string,
 *   label?: string,
 *   className?: string,
 *   target?: string,
 *   variant?: "default" | "outline" | "secondary" | "ghost",
 *   size?: "sm" | "default" | "icon",
 *   iconOnly?: boolean,
 * }} props
 */
export function AdminInlineEditButton({
  href,
  label = "Edit konten",
  className,
  target,
  variant = "default",
  size = "sm",
  iconOnly = false,
}) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "gap-1.5 font-medium shrink-0 shadow-none cursor-pointer",
        size === "sm" && "h-8 px-3 text-xs rounded-lg",
        className
      )}
    >
      <Link
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={label}
      >
        <Pencil className={cn("shrink-0", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        {!iconOnly && <span>{label}</span>}
      </Link>
    </Button>
  );
}
