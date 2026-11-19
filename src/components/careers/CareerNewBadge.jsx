import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

/**
 * Atomic component: 'Baru' badge chip for vacancies posted today
 * Clean, no dots, accessible, reusable across cards and detail view.
 * @param {object} props
 * @param {string} [props.className]
 */
export function CareerNewBadge({ className = "" }) {
  return (
    <Badge
      variant="info"
      className={cn("shrink-0 select-none", className)}
    >
      Baru
    </Badge>
  );
}
