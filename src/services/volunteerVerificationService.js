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

    let userAvatar = null;
    if (v.email) {
      const u = await prisma.user.findFirst({
        where: { email: { equals: v.email.trim().toLowerCase(), mode: "insensitive" } },
        select: { avatar: true },
      });
      userAvatar = u?.avatar || null;
    }

    return mapToPublicVolunteer(v, userAvatar);
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
    const [v, u] = await Promise.all([
      prisma.volunteer.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
      }),
      prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
        select: { avatar: true },
      }),
    ]);

    if (v) return mapToPublicVolunteer(v, u?.avatar || null);

    return null;
  } catch (error) {
    console.error("Prisma getVolunteerByEmail error:", error);
    return null;
  }
}

function mapToPublicVolunteer(v, avatarUrl = null) {
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
    avatarUrl: avatarUrl || null,
    createdAt: createdDate.toISOString(),
    validUntil: expiryDate.toISOString(),
    orgName: ORG_PROFILE.name,
    legalSk: ORG_PROFILE.legal.skKemenkumham,
  };
}
