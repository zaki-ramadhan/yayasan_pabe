import Image from "next/image";
import { ORG_PROFILE } from "@/data/orgProfile";
import { FooterSocialLinks } from "./footer/FooterSocialLinks";
import { FooterBankAccounts } from "./footer/FooterBankAccounts";
import { FooterNavLinks } from "./footer/FooterNavLinks";
import { FooterContactInfo } from "./footer/FooterContactInfo";
import { FooterPaymentLogos } from "./footer/FooterPaymentLogos";
import { FooterBottomBar } from "./footer/FooterBottomBar";
import { getFoundationWhatsAppUrl } from "@/lib/whatsappUtils";

export function Footer() {
  const whatsappUrl = getFoundationWhatsAppUrl();

  return (
    <footer className="relative z-40 overflow-hidden bg-slate-950 text-white pt-12 pb-8 border-t border-slate-800">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-100 bg-[url('/img/textures/texture-overlay-1.webp')]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/70 via-slate-950/90 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800/80">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-700 shadow-xs flex items-center justify-center">
                <Image
                  src="/img/branding/logo-ypabe.webp"
                  alt="Logo Yayasan Payung Berkah"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-medium text-base sm:text-lg text-white tracking-tight leading-tight">
                  {ORG_PROFILE.name}
                </span>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-normal">
                  {ORG_PROFILE.tagline}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-slate-200 pt-0.5">
              <p><span className="text-white font-medium">SK Kemenkumham:</span> {ORG_PROFILE.legal.skKemenkumham}</p>
              <p><span className="text-white font-medium">Izin Dinsos:</span> {ORG_PROFILE.legal.izinIzinSosial}</p>
              <p><span className="text-white font-medium">NPWP:</span> {ORG_PROFILE.legal.npwp}</p>
            </div>

            <FooterSocialLinks whatsappUrl={whatsappUrl} />
          </div>

          <div className="lg:col-span-3">
            <FooterBankAccounts />
          </div>

          <div className="lg:col-span-2">
            <FooterNavLinks />
          </div>

          <div className="lg:col-span-3">
            <FooterContactInfo whatsappUrl={whatsappUrl} />
          </div>
        </div>

        <FooterPaymentLogos />
        <FooterBottomBar />
      </div>
    </footer>
  );
}

