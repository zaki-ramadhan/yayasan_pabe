import Link from "next/link";
import Image from "next/image";
import { getFoundationWhatsAppUrl } from "@/lib/whatsappUtils";

export function ErrorStandaloneLayout({ children }) {
  const currentYear = new Date().getFullYear();
  const waHelpUrl = getFoundationWhatsAppUrl(
    "Halo Admin Yayasan Payung Berkah, saya mengalami kendala saat mengakses website."
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-primary/10">
      <header className="w-full py-3.5 px-4 sm:px-6 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Beranda Yayasan Payung Berkah">
            <Image
              src="/img/branding/logo-ypabe.webp"
              alt="Logo Yayasan Payung Berkah"
              width={140}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 my-auto">
        {children}
      </main>

      <footer className="w-full py-6 sm:py-8 px-4 sm:px-6 border-t border-slate-200/60 bg-white/60 text-center mt-auto">
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          &copy; {currentYear} Yayasan Payung Berkah (PABE). Butuh bantuan?{" "}
          <a
            href={waHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1 ml-0.5"
          >
            Hubungi WhatsApp Resmi
          </a>
        </p>
      </footer>
    </div>
  );
}
