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
      // Cek fallback mock data untuk testing jika di database belum ada
      const mock = [
        {
          id: "vol-1",
          fullName: "Ahmad Fauzi",
          city: "Bogor",
          interest: "Pengajar & Pembimbing Al-Qur'an",
          status: "PENDING",
          createdAt: new Date(),
        },
        {
          id: "vol-2",
          fullName: "Siti Rahmawati",
          city: "Depok",
          interest: "Distribusi Logistik & Bantuan Sosial",
          status: "APPROVED",
          createdAt: new Date(Date.now() - 86400000 * 30),
        },
        {
          id: "vol-3",
          fullName: "Rizky Ramadhan",
          city: "Jakarta Selatan",
          interest: "Dokumentasi & Media Sosial",
          status: "CONTACTED",
          createdAt: new Date(Date.now() - 86400000 * 60),
        },
      ];

      const found = mock.find((m) => m.id === id);
      if (found) {
        return mapToPublicVolunteer(found);
      }

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

    // Mock volunteer untuk pengujian akun relawan demo (Bagas Pratama)
    if (cleanEmail === "bagas.relawan@gmail.com" || cleanEmail.includes("relawan")) {
      return {
        id: "vol-bagas",
        volunteerId: "REL-2026-0004",
        fullName: "Bagas Pratama",
        city: "Bandung",
        interest: "Koordinator Relawan Aksi Lapangan",
        status: "APPROVED",
        isApproved: true,
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 305).toISOString(),
        orgName: ORG_PROFILE.name,
        legalSk: ORG_PROFILE.legal.skKemenkumham,
      };
    }

    return null;
  } catch (error) {
    console.warn("Prisma getVolunteerByEmail fallback:", error?.message);
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
