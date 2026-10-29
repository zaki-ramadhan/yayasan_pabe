import { StatusBadge } from "@/components/ui/Badge";

export function AdminRoutineDonationStatusBadge({ status, className }) {
  return <StatusBadge status={status} className={className} />;
}

