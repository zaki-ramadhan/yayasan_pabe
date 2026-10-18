"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { ORG_PROFILE } from "@/data/orgProfile";

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Only show on donation and program pages (and their subpages)
  const isDonationPage =
    pathname?.startsWith("/program") ||
    pathname?.startsWith("/campaign") ||
    pathname?.startsWith("/donasi-rutin") ||
    pathname?.startsWith("/kalkulator-zakat");

  const isHiddenPage = pathname?.startsWith("/dashboard") || pathname === "/login";

  if (!isDonationPage || isHiddenPage) {
    return null;
  }

  const cleanPhone = ORG_PROFILE.contacts.whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Assalamu'alaikum Yayasan PABE, mohon info program yayasan.")}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600 border-t border-t-emerald-300 border-x border-x-emerald-500 border-b-2 border-b-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_12px_rgba(5,150,105,0.35)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all cursor-pointer"
        aria-label="Ada Pertanyaan?"
      >
        <WhatsAppIcon className="w-4.5 h-4.5 text-white shrink-0" />
        <span>Ada Pertanyaan?</span>
      </a>
    </div>
  );
}
