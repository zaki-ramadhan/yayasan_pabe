import Link from "next/link";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { cn } from "@/lib/utils";

/**
 * Standardized Breadcrumb navigation
 * @param {Array<{ label: string, href?: string }>} items
 * @param {string} className
 */
export function Breadcrumb({ items = [], className = "" }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 sm:gap-2 flex-wrap font-normal",
        className
      )}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
            {idx > 0 && (
              <AltArrowRightIcon
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                aria-hidden="true"
              />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-primary hover:underline transition-colors truncate max-w-[160px] sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-slate-950 font-medium truncate max-w-sm sm:max-w-md"
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
