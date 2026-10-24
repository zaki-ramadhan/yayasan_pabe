import { StatusBadge } from "@/components/ui/badge";

export function AdminRoutineDonationStatusBadge({ status, className }) {
  return <StatusBadge status={status} className={className} />;
}

