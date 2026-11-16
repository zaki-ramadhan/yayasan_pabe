import Link from "next/link";
import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { cn } from "@/lib/utils";

/**
 * Standardized Back navigation link
 * @param {string} href
 * @param {string} label
 * @param {string} className
 */
export function BackLink({ href, label, className = "" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-primary hover:underline transition-colors py-0.5 group",
        className
      )}
    >
      <ArrowLeftIcon className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </Link>
  );
}
