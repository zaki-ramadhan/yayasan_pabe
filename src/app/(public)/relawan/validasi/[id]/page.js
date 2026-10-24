import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getVolunteerPublicProfile } from "@/services/volunteerVerificationService";
import { VolunteerVerificationCard } from "@/components/volunteer/VolunteerVerificationCard";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const volunteer = await getVolunteerPublicProfile(id);

  if (volunteer && volunteer.isApproved) {
    return {
      title: `Validasi Relawan: ${volunteer.fullName} (#${volunteer.volunteerId})`,
      description: `Verifikasi keaslian identitas resmi relawan ${volunteer.fullName} di Yayasan Payung Berkah.`,
    };
  }

  return {
    title: "Validasi Kartu Relawan Resmi",
    description: "Layanan verifikasi keaslian identitas resmi relawan Yayasan Payung Berkah.",
  };
}

export default async function VolunteerValidationPage({ params }) {
  const { id } = await params;
  const volunteer = await getVolunteerPublicProfile(id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Relawan", href: "/volunteer" },
          { label: "Validasi Kartu Anggota" },
        ]}
      />

      <div className="py-2">
        <VolunteerVerificationCard volunteer={volunteer} />
      </div>
    </main>
  );
}
