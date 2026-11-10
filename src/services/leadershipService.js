import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ORG_PROFILE } from "@/data/orgProfile";
import {
  STAFF_ROLES,
  DEFAULT_STRUCTURAL_TITLES,
  TITLE_HIERARCHY_ORDER,
  resolveStaffAvatar,
  getExcludedLeadershipEmails,
  isNonStructuralTechTitle,
} from "@/constants/staffConstants";

/**
 * Mengambil urutan bobot hierarki jabatan.
 * @param {string|null} title
 * @returns {number}
 */
function getHierarchyWeight(title) {
  if (!title) return 99;
  const normalized = title.trim().toLowerCase();
  for (const [key, weight] of Object.entries(TITLE_HIERARCHY_ORDER)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return weight;
    }
  }
  return 99;
}

/**
 * Memastikan teks jabatan struktural yayasan yang tampil di publik (/tentang-kami)
 * murni jabatan struktural yayasan, bukan role teknis sistem (Super Admin / Admin).
 *
 * @param {string|null} title
 * @param {string} name
 * @returns {string}
 */
export function sanitizePublicLeadershipTitle(title, name = "") {
  if (!title || typeof title !== "string") return "Pengurus Yayasan";
  const trimmed = title.trim();
  const lower = trimmed.toLowerCase();

  // Ekstrak jabatan di dalam tanda kurung, misal: "Super Admin (Ketua Yayasan)" -> "Ketua Yayasan"
  const bracketMatch = trimmed.match(/\((.*?)\)/);
  if (bracketMatch && (lower.startsWith("super admin") || lower.startsWith("admin"))) {
    return bracketMatch[1].trim();
  }

  // Jika title mentah berisi role sistem teknis, mapping ke nama jabatan yayasan yang wajar
  if (
    lower === "super admin" ||
    lower === "superadmin" ||
    lower === "super_admin" ||
    lower === "admin" ||
    lower === "admin yayasan"
  ) {
    if (name.toLowerCase().includes("fauzan")) {
      return "Dewan Pembina Yayasan";
    }
    return "Pengurus Yayasan";
  }

  return trimmed;
}

/**
 * Memastikan 6 pengurus struktural yayasan default tersimpan di PostgreSQL
 * jika database belum terisi pengurus (misal saat inisialisasi awal production).
 */
export async function ensureDefaultLeadersSeeded() {
  try {
    const excludedEmails = getExcludedLeadershipEmails();
    const existingCount = await prisma.user.count({
      where: {
        role: { in: STAFF_ROLES },
        ...(excludedEmails.length > 0
          ? {
              email: { notIn: excludedEmails },
            }
          : {}),
      },
    });

    if (existingCount > 0) return;

    const defaultLeaders = [
      {
        name: "Suko Pranoto",
        email: "suko.pranoto@internal.yayasanpayungberkah.org",
        role: "ADMIN",
        title: "Ketua Dewan Pembina",
        gender: "MALE",
        avatar: "/img/avatars/avatar-male.svg",
      },
      {
        name: "Katino",
        email: "katino@internal.yayasanpayungberkah.org",
        role: "ADMIN",
        title: "Anggota Dewan Pembina",
        gender: "MALE",
        avatar: "/img/avatars/avatar-male.svg",
      },
      {
        name: "Paimin",
        email: "paimin@internal.yayasanpayungberkah.org",
        role: "ADMIN",
        title: "Dewan Pengawas",
        gender: "MALE",
        avatar: "/img/avatars/avatar-male.svg",
      },
      {
        name: "Yuni Marlina, S.Pd.I.",
        email: "admin@yayasanpayungberkah.org",
        role: "ADMIN",
        title: "Ketua Yayasan",
        gender: "FEMALE",
        avatar: "/img/avatars/avatar-female.svg",
      },
      {
        name: "Shofi Hidayatullah Akbar, S.Ag.",
        email: "relawan@yayasanpayungberkah.org",
        role: "ADMIN",
        title: "Sekretaris",
        gender: "MALE",
        avatar: "/img/avatars/avatar-male.svg",
      },
      {
        name: "Sarini",
        email: "finance@yayasanpayungberkah.org",
        role: "FINANCE",
        title: "Bendahara",
        gender: "FEMALE",
        avatar: "/img/avatars/avatar-female.svg",
      },
    ];

    const hasGenderField = Boolean(Prisma?.UserScalarFieldEnum?.gender);

    for (const leader of defaultLeaders) {
      const exists = await prisma.user.findFirst({
        where: {
          OR: [{ email: leader.email }, { name: leader.name }],
        },
      });

      if (!exists) {
        await prisma.user.create({
          data: {
            name: leader.name,
            email: leader.email,
            role: leader.role,
            title: leader.title,
            avatar: leader.avatar,
            isActive: true,
            ...(hasGenderField ? { gender: leader.gender } : {}),
          },
        }).catch(() => null);
      }
    }
  } catch (err) {
    console.warn("ensureDefaultLeadersSeeded warning:", err.message);
  }
}

/**
 * Mengambil daftar struktur kepengurusan resmi untuk ditampilkan pada halaman publik (/tentang-kami).
 * Memiliki fallback aman ke data statis orgProfile.js jika database belum terisi.
 * Mengecualikan akun vendor / developer teknis eksternal agar tidak tercantum di publik.
 *
 * @returns {Promise<Array<{ name: string, role: string, division?: string, gender: string, image: string }>>}
 */
export async function getPublicLeadership() {
  try {
    await ensureDefaultLeadersSeeded();

    const hasGenderField = Boolean(Prisma?.UserScalarFieldEnum?.gender);
    const excludedEmails = getExcludedLeadershipEmails();

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: STAFF_ROLES },
        ...(excludedEmails.length > 0
          ? {
              email: {
                notIn: excludedEmails,
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        avatar: true,
        salutation: true,
        ...(hasGenderField ? { gender: true } : {}),
      },
    });

    // Sanitasi lapis kedua di memori: filter email vendor/dev dan jabatan murni teknis non-struktural
    const excludedSet = new Set(excludedEmails.map((e) => e.toLowerCase()));
    const eligibleUsers = (users || []).filter((u) => {
      if (u.email && excludedSet.has(u.email.toLowerCase())) return false;
      // Jangan tampilkan akun dengan peran teknis murni website (Admin Web, IT, Developer, dll.)
      if (isNonStructuralTechTitle(u.title)) return false;
      return true;
    });

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return ORG_PROFILE.leadership || [];
    }

    // Urutkan berdasarkan hierarki jabatan struktural, lalu nama
    const sorted = [...eligibleUsers].sort((a, b) => {
      const titleA = sanitizePublicLeadershipTitle(a.title, a.name);
      const titleB = sanitizePublicLeadershipTitle(b.title, b.name);
      const weightA = getHierarchyWeight(titleA);
      const weightB = getHierarchyWeight(titleB);
      if (weightA !== weightB) return weightA - weightB;
      return a.name.localeCompare(b.name, "id");
    });

    return sorted.map((u) => {
      const displayTitle = sanitizePublicLeadershipTitle(u.title, u.name);
      const gender =
        u.gender ||
        (u.salutation === "Ibu" || u.salutation === "Hj." || u.avatar?.includes("female")
          ? "FEMALE"
          : "MALE");

      return {
        id: u.id,
        name: u.name,
        role: displayTitle,
        gender: gender === "FEMALE" ? "P" : "L",
        image: resolveStaffAvatar(u.avatar, gender),
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data pengurus publik:", error);
    return ORG_PROFILE.leadership || [];
  }
}

/**
 * Mengambil daftar jabatan struktural unik yang ada di database,
 * digabungkan dengan rekomendasi standar untuk opsi combobox.
 *
 * @returns {Promise<string[]>}
 */
export async function getDistinctStaffTitles() {
  try {
    const excludedEmails = getExcludedLeadershipEmails();

    const records = await prisma.user.findMany({
      where: {
        role: { in: STAFF_ROLES },
        title: { not: null },
        ...(excludedEmails.length > 0
          ? {
              email: {
                notIn: excludedEmails,
              },
            }
          : {}),
      },
      select: { title: true, email: true },
      distinct: ["title"],
    });

    const excludedSet = new Set(excludedEmails.map((e) => e.toLowerCase()));
    const dbTitles = records
      .filter((r) => !r.email || !excludedSet.has(r.email.toLowerCase()))
      .map((r) => r.title?.trim())
      .filter((t) => Boolean(t && t.length > 0));

    // Gabungkan dengan default preset dan hapus duplikat (case-insensitive)
    const titleMap = new Map();

    for (const title of [...DEFAULT_STRUCTURAL_TITLES, ...dbTitles]) {
      const key = title.toLowerCase();
      if (!titleMap.has(key)) {
        titleMap.set(key, title);
      }
    }

    return Array.from(titleMap.values());
  } catch (error) {
    console.error("Gagal mengambil distinct staff titles:", error);
    return [...DEFAULT_STRUCTURAL_TITLES];
  }
}
