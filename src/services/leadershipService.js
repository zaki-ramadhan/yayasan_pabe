import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ORG_PROFILE } from "@/data/orgProfile";
import { resolveUserAvatar } from "@/lib/userParser";
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

  const bracketMatch = trimmed.match(/\((.*?)\)/);
  if (bracketMatch && (lower.startsWith("super admin") || lower.startsWith("admin"))) {
    return bracketMatch[1].trim();
  }

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

const KNOWN_STAFF_ACCOUNTS = {
  "Yuni Marlina, S.Pd.I.": { email: "admin@yayasanpayungberkah.org", role: "ADMIN" },
  "Shofi Hidayatullah Akbar, S.Ag.": { email: "relawan@yayasanpayungberkah.org", role: "ADMIN" },
  "Sarini": { email: "finance@yayasanpayungberkah.org", role: "FINANCE" },
  "Suko Pranoto": { email: "suko.pranoto@internal.yayasanpayungberkah.org", role: "ADMIN" },
  "Katino": { email: "katino@internal.yayasanpayungberkah.org", role: "ADMIN" },
  "Paimin": { email: "paimin@internal.yayasanpayungberkah.org", role: "ADMIN" },
};

function slugifyStaffEmail(name) {
  const cleanName = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
  return `${cleanName || "pengurus"}@internal.yayasanpayungberkah.org`;
}

/**
 * Memastikan pengurus struktural yayasan dari konfigurasi orgProfile tersimpan di PostgreSQL
 * jika personil tersebut belum terdaftar di database.
 * Perubahan manual berikutnya lewat Admin Panel tetap terlindungi dan tidak akan ditimpa.
 */
export async function ensureDefaultLeadersSeeded() {
  try {
    const leaders = ORG_PROFILE.leadership || [];
    if (!Array.isArray(leaders) || leaders.length === 0) return;

    const hasGenderField = Boolean(Prisma?.UserScalarFieldEnum?.gender);
    const OLD_TO_NEW_TITLES = {
      "Dewan Pengawas": "Pengawas",
      "Ketua Yayasan": "Ketua Umum",
      "Sekretaris": "Sekretaris Umum",
      "Bendahara": "Bendahara Umum",
    };

    for (const leader of leaders) {
      if (!leader.name) continue;

      const known = KNOWN_STAFF_ACCOUNTS[leader.name];
      const email = known?.email || slugifyStaffEmail(leader.name);
      const isFinance = known?.role === "FINANCE" || leader.role?.toLowerCase().includes("bendahara");
      const role = known?.role || (isFinance ? "FINANCE" : "ADMIN");
      const isFemale = leader.gender === "P" || leader.gender === "FEMALE";
      const avatar = leader.image || (isFemale ? "/img/avatars/avatar-female.svg" : "/img/avatars/avatar-male.svg");

      const exists = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { name: leader.name }],
        },
      });

      if (!exists) {
        await prisma.user.create({
          data: {
            name: leader.name,
            email,
            role,
            title: leader.role,
            avatar,
            isActive: true,
            ...(hasGenderField ? { gender: isFemale ? "FEMALE" : "MALE" } : {}),
          },
        }).catch(() => null);
      } else if (exists && OLD_TO_NEW_TITLES[exists.title] && leader.role === OLD_TO_NEW_TITLES[exists.title]) {
        await prisma.user.update({
          where: { id: exists.id },
          data: { title: leader.role },
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
 * @returns {Promise<Array<{ name: string, role: string, gender: string, image: string }>>}
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
        customAvatar: true,
        providerAvatar: true,
        salutation: true,
        ...(hasGenderField ? { gender: true } : {}),
      },
    });

    const excludedSet = new Set(excludedEmails.map((e) => e.toLowerCase()));
    const eligibleUsers = (users || []).filter((u) => {
      if (u.email && excludedSet.has(u.email.toLowerCase())) return false;
      if (isNonStructuralTechTitle(u.title)) return false;
      return true;
    });

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return ORG_PROFILE.leadership || [];
    }

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
      const resolvedAvatar = resolveUserAvatar(u) || u.avatar || null;
      const gender =
        u.gender ||
        (u.salutation === "Ibu" || u.salutation === "Hj." || resolvedAvatar?.includes("female")
          ? "FEMALE"
          : "MALE");

      return {
        id: u.id,
        name: u.name,
        role: displayTitle,
        gender: gender === "FEMALE" ? "P" : "L",
        image: resolveStaffAvatar(resolvedAvatar, gender),
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
