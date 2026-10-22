import { Skeleton } from "@/components/ui/skeleton";

export function AdminSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* 1. Identitas Yayasan Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 sm:col-span-2 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-20 sm:col-span-2 rounded-md" />
        </div>
      </div>

      {/* 2. Legalitas Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-72 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>

      {/* 3. Kontak Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-3.5 w-80 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 sm:col-span-2 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>

      {/* 4. Rekening Bank Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-60 rounded" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
