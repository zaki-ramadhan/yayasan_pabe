"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { resolveUserAvatar } from "@/lib/userParser";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Reusable user avatar chip trigger button for header dropdown menus.
 * Renders a pill/chip container with a circular avatar and a dropdown toggle arrow.
 */
export const UserAvatarChipTrigger = React.forwardRef(
  function UserAvatarChipTrigger(
    {
      currentUser,
      isOpen = false,
      className = "",
      ariaLabel = "Buka menu profil pengguna",
      ...props
    },
    ref
  ) {
    const [imgError, setImgError] = useState(false);
    const avatarUrl = !imgError ? resolveUserAvatar(currentUser) : null;
    const fallbackInitial =
      currentUser?.initials ||
      getInitials(currentUser?.name, currentUser?.email || "U");

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "group flex items-center gap-1.5 p-1 pr-1.5 sm:pr-2 rounded-full transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          isOpen
            ? "bg-slate-100 border border-slate-300 shadow-2xs ring-2 ring-primary/15"
            : "bg-transparent hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300",
          className
        )}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        {...props}
      >
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
              alt={currentUser?.name || "Avatar"}
              fill
              sizes="32px"
              unoptimized={
                typeof avatarUrl === "string" &&
                !avatarUrl.startsWith("/") &&
                !avatarUrl.includes("lh3.googleusercontent.com")
              }
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-medium text-xs text-slate-800">
              {fallbackInitial}
            </span>
          )}
        </div>

        <AltArrowDownIcon
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
            isOpen
              ? "rotate-180 text-primary"
              : "text-slate-500 group-hover:text-slate-800"
          )}
        />
      </button>
    );
  }
);

UserAvatarChipTrigger.displayName = "UserAvatarChipTrigger";
