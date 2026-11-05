"use client";

import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";

/**
 * Compact & Clean Popover Menu for WhatsApp Service Lines
 *
 * @param {object} props
 * @param {Array<object>} props.services - Customer service contact list
 * @param {() => void} [props.onClose] - Close popover handler
 */
export function CustomerServiceHubMenu({
  services,
  onClose,
}) {
  return (
    <div className="w-56 sm:w-60 p-1 space-y-0.5 text-sm select-none">
      {services.map((cs) => {
        const waUrl = buildWhatsAppUrl(cs.phone, cs.defaultMessage);
        return (
          <a
            key={cs.id}
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors group cursor-pointer"
            aria-label={`Hubungi ${cs.name} via WhatsApp`}
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform" />
            <span className="font-medium text-slate-800 group-hover:text-slate-950 truncate">
              {cs.name}
            </span>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              {cs.isPrimary && (
                <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Utama
                </span>
              )}
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
