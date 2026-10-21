import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toast";
import { OfflineStatusBanner } from "@/components/shared/OfflineStatusBanner";
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

const crustaceans = localFont({
  src: "./fonts/Crustaceans-SignatureDEMO-Regular.otf",
  variable: "--font-crustaceans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Yayasan Generasi Sejahtera Mandiri",
    template: "%s",
  },
  description:
    "Platform resmi donasi, zakat, infak, sedekah, dan wakaf Yayasan Generasi Sejahtera Mandiri. Transparan, amanah, dan terpercaya.",
  keywords: [
    "donasi online",
    "zakat online",
    "sedekah subuh",
    "wakaf",
    "yayasan generasi sejahtera mandiri",
    "kalkulator zakat",
  ],
  authors: [{ name: "Yayasan Generasi Sejahtera Mandiri" }],
  icons: {
    icon: "/logo_yayasan_GSM.png",
    shortcut: "/logo_yayasan_GSM.png",
    apple: "/logo_yayasan_GSM.png",
  },
  openGraph: {
    title: "Yayasan Generasi Sejahtera Mandiri",
    description: "Salurkan kepedulian Anda untuk masa depan santri, dakwah Al-Qur'an, dan aksi kemanusiaan.",
    siteName: "Yayasan Generasi Sejahtera Mandiri",
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
      className={`${geistSans.variable} ${geistMono.variable} ${crustaceans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-surface text-slate-900 font-sans"
        suppressHydrationWarning
      >
        <OfflineStatusBanner />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
