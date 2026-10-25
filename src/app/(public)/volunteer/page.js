import Image from "next/image";
import { VolunteerForm } from "@/components/modules/VolunteerForm";
import { VolunteerPerksList } from "@/components/volunteer/VolunteerPerksList";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Gabung Jadi Relawan Aksi",
  description: "Daftarkan diri Anda sebagai relawan aksi kemanusiaan dan pendidikan santri tahfidz Yayasan Payung Berkah.",
};

export default function VolunteerPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Editorial & Value Prop */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Cover Image Landscape (Tinggi lebih ramping/kompak) */}
          <div className="relative w-full h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100 pointer-events-none select-none">
            <Image
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=80"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover pointer-events-none select-none"
              draggable={false}
              aria-hidden="true"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent pointer-events-none select-none" />
          </div>

          <PageHeader
            title="Gabung Menjadi Relawan Kebaikan"
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
