import Image from "next/image";
import { ORG_PROFILE } from "@/data/orgProfile";
import { FooterSocialLinks } from "./footer/FooterSocialLinks";
import { FooterBankAccounts } from "./footer/FooterBankAccounts";
import { FooterNavLinks } from "./footer/FooterNavLinks";
import { FooterContactInfo } from "./footer/FooterContactInfo";
import { FooterPaymentLogos } from "./footer/FooterPaymentLogos";
import { FooterBottomBar } from "./footer/FooterBottomBar";

export function Footer() {
  const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent("Assalamu'alaikum Admin Yayasan PABE, saya ingin bertanya seputar donasi & ZISWAF.")}`;

  return (
    <footer className="relative z-40 overflow-hidden bg-slate-950 text-white pt-12 pb-8 border-t border-slate-800">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-100 bg-[url('/img/texture_overlay.jpeg')]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/70 via-slate-950/90 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800/80">
          {/* Col 1: Profil, Tagline & Legalitas (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-700 shadow-xs flex items-center justify-center">
                <Image
                  src="/logo_yayasan_GSM.png"
                  alt="Logo Yayasan Payung Berkah"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
              <span className="font-semibold text-base sm:text-lg text-white tracking-tight leading-snug">
                Yayasan Payung Berkah
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {ORG_PROFILE.tagline}
            </p>

            <div className="space-y-1 text-sm text-slate-200 pt-0.5">
              <p><span className="text-white font-medium">SK Kemenkumham:</span> {ORG_PROFILE.legal.skKemenkumham}</p>
              <p><span className="text-white font-medium">Izin Dinsos:</span> {ORG_PROFILE.legal.izinIzinSosial}</p>
              <p><span className="text-white font-medium">NPWP:</span> {ORG_PROFILE.legal.npwp}</p>
            </div>

            {/* Social Media Icons */}
            <FooterSocialLinks whatsappUrl={whatsappUrl} />
          </div>

          {/* Col 2: Rekening Resmi Yayasan (3 cols) */}
          <div className="lg:col-span-3">
            <FooterBankAccounts />
          </div>

          {/* Col 3: Navigasi Cepat (2 cols) */}
          <div className="lg:col-span-2">
            <FooterNavLinks />
          </div>

          {/* Col 4: Kontak, Alamat & Tombol WA (3 cols) */}
          <div className="lg:col-span-3">
            <FooterContactInfo whatsappUrl={whatsappUrl} />
          </div>
        </div>

        {/* Section Bawah: Kanal Donasi & Pembayaran Resmi */}
        <FooterPaymentLogos />

        {/* Bottom copyright & Links with clean slash separators */}
        <FooterBottomBar />
      </div>
    </footer>
  );
}

