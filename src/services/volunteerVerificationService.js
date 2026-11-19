import prisma from "@/lib/prisma";
import { ORG_PROFILE } from "@/data/orgProfile";
import { formatVolunteerId } from "@/lib/volunteerUtils";
import { resolveUserAvatar } from "@/lib/userParser";

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
        select: { avatar: true, customAvatar: true, providerAvatar: true },
      });
      userAvatar = resolveUserAvatar(u);
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
        select: { avatar: true, customAvatar: true, providerAvatar: true },
      }),
    ]);

    if (v) {
      const userAvatar = resolveUserAvatar(u);
      return mapToPublicVolunteer(v, userAvatar);
    }

    return null;
  } catch (error) {
    console.error("Prisma getVolunteerByEmail error:", error);
    return null;
  }
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function mapToPublicVolunteer(v, avatarUrl = null) {
  const createdDate = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
  const expiryDate = new Date(createdDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return {
    id: v.id,
    volunteerId: formatVolunteerId(v.id, createdDate),
    fullName: v.fullName,
    maskedEmail: v.email ? maskEmail(v.email) : null,
    city: v.city,
    interest: v.interest,
    status: v.status,
    isApproved: v.status === "APPROVED",
    avatar: avatarUrl || null,
    avatarUrl: avatarUrl || null,
    createdAt: createdDate.toISOString(),
    validUntil: expiryDate.toISOString(),
    orgName: ORG_PROFILE.name,
    legalSk: ORG_PROFILE.legal.skKemenkumham,
  };
}
