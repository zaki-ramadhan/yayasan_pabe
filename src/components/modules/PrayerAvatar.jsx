import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export function PrayerAvatar({ name = "H", avatar, src, size = "md", className }) {
  const initial = (name || "H").charAt(0).toUpperCase();
  const avatarUrl = src || avatar || null;

  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-8 h-8 text-xs",
  };

  return (
    <Avatar
      className={cn(
        "rounded-full bg-slate-200 shrink-0 select-none overflow-hidden",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={name}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarFallback className="bg-slate-100 text-slate-800 font-medium flex items-center justify-center w-full h-full">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
