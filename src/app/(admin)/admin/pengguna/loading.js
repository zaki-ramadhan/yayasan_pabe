import { AdminUserSkeleton } from "@/components/admin/users/AdminUserSkeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
      </div>

      <AdminUserSkeleton />
    </div>
  );
}
