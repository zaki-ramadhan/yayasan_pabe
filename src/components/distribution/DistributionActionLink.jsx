"use client";

import { Download } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

/**
 * Atom component: Clean native PDF download action with user feedback
 * Uses direct HTTP Content-Disposition attachment streaming to avoid:
 * 1. Double trigger conflicts between browser download managers and IDM extension.
 * 2. 0-byte corrupted files caused by premature blob URL revocation in JavaScript.
 *
 * @param {object} props
 * @param {string} [props.href="/api/documents/download?type=audit"]
 * @param {string} [props.label="Unduh PDF"]
 * @param {string} [props.filename="dokumen.pdf"]
 * @param {string} [props.documentTitle]
 * @param {string} [props.className]
 */
export function DistributionActionLink({
  href = "/api/documents/download?type=audit",
  label = "Unduh PDF",
  filename = "dokumen.pdf",
  documentTitle = "Dokumen",
  className,
}) {
  const handleClick = (e) => {
    if (!href || href === "#") {
      e.preventDefault();
      toast.info("Dokumen ini sedang disiapkan oleh sekretariat yayasan.");
      return;
    }

    toast.success(`Memulai unduhan ${documentTitle}...`);
  };

  return (
    <a
      href={href}
      download={filename}
      onClick={handleClick}
      aria-label={`Unduh ${documentTitle} dalam format PDF`}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors shrink-0 cursor-pointer pt-1 sm:pt-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-md px-1 py-0.5",
        className
      )}
    >
      <Download className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:-translate-y-0.5 transition-all duration-150" />
      <span>{label}</span>
    </a>
  );
}
