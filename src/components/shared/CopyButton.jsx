"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Salin",
  successMessage = "Berhasil disalin!",
  className,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin teks.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer",
        copied
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tersalin</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
