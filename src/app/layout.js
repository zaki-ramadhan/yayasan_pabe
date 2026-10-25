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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yayasan Payung Berkah | PABE",
    template: "%s | Yayasan Payung Berkah",
  },
  description:
    "Platform resmi donasi, zakat, infak, sedekah, dan wakaf Yayasan Payung Berkah (PABE). Hidup Berkah dengan Sedekah.",
  keywords: [
    "donasi online",
    "zakat online",
    "sedekah subuh",
    "wakaf",
    "yayasan payung berkah",
    "pabe",
    "hidup berkah dengan sedekah",
    "kalkulator zakat",
  ],
  authors: [{ name: "Yayasan Payung Berkah (PABE)" }],
  icons: {
    icon: "/img/logo/logo_ypabe.jpeg",
    shortcut: "/img/logo/logo_ypabe.jpeg",
    apple: "/img/logo/logo_ypabe.jpeg",
  },
  openGraph: {
    title: "Yayasan Payung Berkah | PABE",
    description:
      "Salurkan kepedulian Anda untuk masa depan santri, dakwah Al-Qur'an, dan aksi kemanusiaan. Hidup Berkah dengan Sedekah.",
    siteName: "Yayasan Payung Berkah",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/img/logo/logo_ypabe.jpeg",
        width: 1200,
        height: 630,
        alt: "Logo Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yayasan Payung Berkah | PABE",
    description: "Salurkan kepedulian Anda untuk masa depan santri dan aksi kemanusiaan.",
    images: ["/img/logo/logo_ypabe.jpeg"],
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
