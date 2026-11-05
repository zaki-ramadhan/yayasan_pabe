"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { getCustomerServices } from "@/lib/whatsappUtils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { CustomerServiceHubMenu } from "./floating-cs/CustomerServiceHubMenu";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hidden on admin, dashboard, or authentication routes
  const isHiddenPage =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/auth") ||
    pathname === "/login";

  if (isHiddenPage) {
    return null;
  }

  const customerServices = getCustomerServices();

  return (
    <div
      id="floating-whatsapp"
      data-testid="floating-whatsapp"
      className="fixed bottom-6 right-6 z-40 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600 border-t border-t-emerald-300 border-x border-x-emerald-500 border-b-2 border-b-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_12px_rgba(5,150,105,0.35)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all cursor-pointer"
            aria-label="Ada pertanyaan? Hubungi admin layanan"
          >
            <WhatsAppIcon className="w-4.5 h-4.5 text-white shrink-0" />
            <span>Ada Pertanyaan?</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          usePortal={false}
          align="end"
          side="top"
          sideOffset={10}
          className="z-40 p-1 w-auto rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 outline-none"
        >
          <CustomerServiceHubMenu
            services={customerServices}
            onClose={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
