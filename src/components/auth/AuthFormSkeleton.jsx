import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton({ mode = "login" }) {
  return (
    <div className="w-full space-y-5 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <Skeleton className="h-7 sm:h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full rounded" />
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-slate-200" />
        <Skeleton className="h-3.5 w-32 rounded" />
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5">
        {mode === "register" && (
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        )}

        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20 rounded" />
            {mode === "login" && <Skeleton className="h-3.5 w-24 rounded" />}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {mode === "login" && (
          <div className="flex items-center gap-2 pt-0.5">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Skeleton className="h-11 w-full rounded-lg mt-2" />

      {/* Switch Link */}
      <div className="pt-2 text-center">
        <Skeleton className="h-4 w-52 mx-auto rounded" />
      </div>
    </div>
  );
}
