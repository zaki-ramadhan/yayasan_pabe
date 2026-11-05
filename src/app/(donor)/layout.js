import { redirect } from "next/navigation";
import { DonorLayoutClient } from "@/components/donor/DonorLayoutClient";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const metadata = {
  title: "Dasbor Donatur",
  description:
    "Area aman kelola donasi, riwayat ZISWAF, dan profil akun Anda di Yayasan Payung Berkah. Hidup Berkah dengan Sedekah.",
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
  const { authenticated, user } = await getAuthenticatedUser();

  if (!authenticated || !user) {
    redirect("/login?redirect=/donatur/dashboard");
  }

  // Jika akun adalah staf/admin, arahkan langsung ke panel admin yayasan
  if (user.role && user.role !== "DONOR") {
    redirect("/admin");
  }

  return <DonorLayoutClient initialUser={user}>{children}</DonorLayoutClient>;
}
