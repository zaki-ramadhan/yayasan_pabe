import prisma from "@/lib/prisma";
import { ORG_PROFILE } from "@/data/orgProfile";
import { formatVolunteerId } from "@/lib/volunteerUtils";

export { formatVolunteerId };

/**
 * Mengambil profil relawan untuk validasi publik scan QR.
 * Hanya mengembalikan atribut publik yang aman (tanpa email/telepon pribadi).
 */
export async function getVolunteerPublicProfile(id) {
  if (!id) return null;

  try {
    const v = await prisma.volunteer.findUnique({
      where: { id },
    });

    if (!v) {
      return null;
    }


    return mapToPublicVolunteer(v);
  } catch (error) {
    console.warn("Prisma getVolunteerPublicProfile fallback:", error?.message);
    return null;
  }
}

/**
 * Mengambil data relawan aktif berdasarkan email untuk panel donatur/relawan
 */
export async function getVolunteerByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const v = await prisma.volunteer.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    });

    if (v) return mapToPublicVolunteer(v);

    return null;
  } catch (error) {
    console.error("Prisma getVolunteerByEmail error:", error);
    return null;
  }
}

function mapToPublicVolunteer(v) {
  const createdDate = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
  const expiryDate = new Date(createdDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return {
    id: v.id,
    volunteerId: formatVolunteerId(v.id, createdDate),
    fullName: v.fullName,
    city: v.city,
    interest: v.interest,
    status: v.status,
    isApproved: v.status === "APPROVED",
    createdAt: createdDate.toISOString(),
    validUntil: expiryDate.toISOString(),
    orgName: ORG_PROFILE.name,
    legalSk: ORG_PROFILE.legal.skKemenkumham,
  };
}
