"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

import { getInitials } from "@/lib/formatters";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, referrerPolicy = "no-referrer", ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    referrerPolicy={referrerPolicy}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary-light text-primary text-xs font-medium uppercase",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Standard reusable user avatar for table rows, drawers, and headers.
 * Encapsulates Radix Avatar, image loading, and fallback initial generation.
 *
 * @param {object} props
 * @param {string} [props.src] - Avatar image URL
 * @param {string} [props.name] - Full user / donor name
 * @param {string} [props.fallback="U"] - Fallback character or email
 * @param {boolean} [props.isAnonymous=false] - If true, displays 'HA' (Hamba Allah)
 * @param {string} [props.className] - Avatar container styling
 * @param {string} [props.fallbackClassName] - Fallback text styling
 * @param {string} [props.referrerPolicy="no-referrer"]
 */
export function UserAvatar({
  src,
  name,
  fallback = "U",
  isAnonymous = false,
  className,
  fallbackClassName,
  referrerPolicy = "no-referrer",
  children,
}) {
  const initial = isAnonymous ? "HA" : getInitials(name, fallback);

  return (
    <Avatar className={cn("w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-100", className)}>
      {src && (
        <AvatarImage
          src={src}
          alt={name || "User"}
          referrerPolicy={referrerPolicy}
        />
      )}
      <AvatarFallback className={cn("bg-slate-100 text-slate-700 text-xs font-medium", fallbackClassName)}>
        {children || initial}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
