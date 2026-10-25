import Image from "next/image";
import { ChevronRight } from "lucide-react";

/**
 * Individual leadership team item
 *
 * @param {object} props
 * @param {object} props.leader - Leader object { name, role, image }
 */
export function LeaderItem({ leader }) {
  if (!leader) return null;

  return (
    <div className="flex items-start gap-3.5 group">
      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
        <Image
          src={leader.image}
          alt={leader.name}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3
            className="text-sm sm:text-base font-medium text-slate-950 leading-snug truncate"
            title={leader.name}
          >
            {leader.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
          <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
          <span
            className="text-xs sm:text-sm font-medium text-slate-700 truncate"
            title={leader.role}
          >
            {leader.role}
          </span>
        </div>
      </div>
    </div>
  );
}
