import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export function PrayerAvatar({ name = "H", size = "md", className }) {
  const initial = (name || "H").charAt(0).toUpperCase();

  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-8 h-8 text-xs",
  };

  return (
    <Avatar
      className={cn(
        "rounded-full border-2 border-white ring-1 ring-slate-300 shadow-xs bg-slate-100 shrink-0 select-none",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      <AvatarFallback className="bg-slate-100 text-slate-800 font-medium flex items-center justify-center w-full h-full">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
