"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export function ShareDropdown({
  url,
  title = "",
  variant = "button",
  align = "end",
  className,
}) {
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => {
    if (url) {
      if (url.startsWith("http")) return url;
      if (typeof window !== "undefined") return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const handleCopyLink = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const shareUrl = getTargetUrl();
    if (!shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success("Tautan berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin tautan.");
    }
  };

  const handleShareWhatsApp = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (typeof window === "undefined") return;
    const shareUrl = getTargetUrl();
    const text = encodeURIComponent(
      title ? `*${title}*\n\nBaca atau ikuti selengkapnya di:\n${shareUrl}` : shareUrl
    );
    window.open(
      `https://api.whatsapp.com/send?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <button
            type="button"
            className={cn(
              "p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer",
              className
            )}
            aria-label={`Bagikan ${title}`}
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8.5 px-2.5 sm:px-3 text-xs sm:text-sm font-normal border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 rounded-lg cursor-pointer",
              className
            )}
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Bagikan</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48 bg-white border border-slate-200 shadow-md rounded-lg p-1 z-50">
        <DropdownMenuItem
          onClick={handleShareWhatsApp}
          className="cursor-pointer gap-2 text-xs sm:text-sm font-normal py-2 px-2.5 rounded-md hover:bg-slate-100 text-slate-800"
        >
          <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer gap-2 text-xs sm:text-sm font-normal py-2 px-2.5 rounded-md hover:bg-slate-100 text-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-normal">Tautan Tersalin!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Salin Tautan</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
