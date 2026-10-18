import { DonorLayoutClient } from "@/components/donor/DonorLayoutClient";

export const metadata = {
  title: {
    default: "Portal Donatur | Yayasan PABE",
    template: "%s | Portal Donatur Yayasan PABE",
  },
  description:
    "Area aman kelola donasi, riwayat ZISWAF, dan profil donatur Yayasan PABE.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function DonorLayout({ children }) {
  return <DonorLayoutClient>{children}</DonorLayoutClient>;
}
