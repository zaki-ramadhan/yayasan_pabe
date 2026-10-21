import { DonorProfileView } from "@/components/donor/DonorProfileView";

export const metadata = {
  title: "Profil Saya",
  description:
    "Kelola data pribadi, informasi rekening bank, foto profil, dan keamanan akun Anda.",
};

export default function DonaturProfilPage() {
  return (
    <div className="space-y-5">
      {/* Page Heading (Tanpa Subheading) */}
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Profil Saya
        </h1>
      </div>

      {/* Profile Content */}
      <DonorProfileView />
    </div>
  );
}
