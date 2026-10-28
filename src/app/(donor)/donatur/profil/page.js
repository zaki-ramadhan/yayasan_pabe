import { DonorProfileView } from "@/components/donor/DonorProfileView";

export const metadata = {
  title: "Profil Saya",
  description:
    "Kelola data pribadi, informasi rekening bank, foto profil, dan keamanan akun Anda.",
};

export default function DonaturProfilPage() {
  return <DonorProfileView />;
}
