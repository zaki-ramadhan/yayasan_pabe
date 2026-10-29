import { RoleBadge, StatusBadge } from "@/components/ui/Badge";

export function AdminUserRoleBadge({ role, className = "" }) {
  return <RoleBadge role={role} className={className} />;
}

export function AdminUserStatusBadge({ isActive, className = "" }) {
  return (
    <StatusBadge
      status={isActive ? "ACTIVE" : "SUSPENDED"}
      label={isActive ? "Aktif" : "Ditangguhkan"}
      className={className}
    />
  );
}

