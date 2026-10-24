import { StatusBadge } from "@/components/ui/badge";

export function AdminVolunteerStatusBadge({ status, className }) {
  return <StatusBadge status={status} className={className} />;
}

