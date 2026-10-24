import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DonorLayoutClient } from "@/components/donor/DonorLayoutClient";

export const metadata = {
  title: "Dashboard",
  description:
    "Area aman kelola donasi, riwayat ZISWAF, dan profil akun Anda di Yayasan Payung Berkah.",
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

export default async function DonorLayout({ children }) {
  const cookieStore = await cookies();
  const session =
    cookieStore.get("pabe_session")?.value ||
    cookieStore.get("ygsm_session")?.value;

  if (!session) {
    redirect("/login?redirect=/donatur/dashboard");
  }

  return <DonorLayoutClient>{children}</DonorLayoutClient>;
}
