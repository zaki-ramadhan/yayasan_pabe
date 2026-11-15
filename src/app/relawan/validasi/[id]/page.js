import { getVolunteerPublicProfile } from "@/services/volunteerVerificationService";
import { VolunteerPublicProfileView } from "@/components/volunteer/VolunteerPublicProfileView";
import { VolunteerInvalidCardFallback } from "@/components/volunteer/VolunteerInvalidCardFallback";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const volunteer = await getVolunteerPublicProfile(id);

  if (volunteer && volunteer.isApproved) {
    return {
      title: `Kartu Relawan: ${volunteer.fullName} (#${volunteer.volunteerId})`,
      description: `Verifikasi resmi keabsahan Kartu Tanda Anggota (KTA) relawan ${volunteer.fullName} di Yayasan Payung Berkah.`,
      openGraph: {
        title: `Kartu Relawan: ${volunteer.fullName} (#${volunteer.volunteerId})`,
        description: `Verifikasi resmi keabsahan Kartu Tanda Anggota (KTA) relawan ${volunteer.fullName} di Yayasan Payung Berkah.`,
        type: "profile",
      },
    };
  }

  return {
    title: "Verifikasi Kartu Relawan Resmi - Yayasan Payung Berkah",
    description: "Layanan verifikasi keaslian identitas resmi relawan Yayasan Payung Berkah.",
  };
}

export default async function VolunteerValidationStandalonePage({ params }) {
  const { id } = await params;
  const volunteer = await getVolunteerPublicProfile(id);

  if (!volunteer || !volunteer.isApproved) {
    return <VolunteerInvalidCardFallback volunteer={volunteer} />;
  }

  return <VolunteerPublicProfileView volunteer={volunteer} />;
}

