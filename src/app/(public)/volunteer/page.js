import { VolunteerForm } from "@/components/modules/VolunteerForm";
import { VolunteerPerksList } from "@/components/volunteer/VolunteerPerksList";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Gabung Jadi Relawan Aksi - Yayasan PABE",
  description: "Daftarkan diri Anda sebagai relawan aksi kemanusiaan dan pendidikan santri tahfidz Yayasan PABE.",
};

export default function VolunteerPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Editorial & Value Prop */}
        <div className="lg:col-span-5 space-y-8">
          <PageHeader
            title="Gabung Menjadi Relawan Kebaikan"
            description="Wujudkan kepedulian nyata dengan menyumbangkan tenaga, waktu, dan keahlian Anda untuk adik-adik santri dan korban bencana di berbagai pelosok."
          />

          <VolunteerPerksList />
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <VolunteerForm />
        </div>
      </div>
    </main>
  );
}
