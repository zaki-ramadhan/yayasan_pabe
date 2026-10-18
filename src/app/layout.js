import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Yayasan PABE - Donasi & ZISWAF",
    template: "%s | Yayasan PABE",
  },
  description:
    "Platform resmi donasi, zakat, infak, sedekah, dan wakaf Yayasan PABE. Transparan, amanah, dan terpercaya.",
  keywords: [
    "donasi online",
    "zakat online",
    "sedekah subuh",
    "wakaf",
    "yayasan pabe",
    "kalkulator zakat",
  ],
  authors: [{ name: "Yayasan PABE" }],
  icons: {
    icon: "/logo_yayasan_GSM.png",
    shortcut: "/logo_yayasan_GSM.png",
    apple: "/logo_yayasan_GSM.png",
  },
  openGraph: {
    title: "Yayasan PABE",
    description: "Salurkan kepedulian Anda untuk masa depan santri, dakwah Al-Qur'an, dan aksi kemanusiaan.",
    siteName: "Yayasan PABE Filantropi",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-surface text-slate-900 font-sans"
        suppressHydrationWarning
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
