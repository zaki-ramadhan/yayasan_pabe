import { USER_ROLES } from "@/services/authService";

/**
 * Daftar role teknis yang diakui sebagai pengurus yayasan.
 */
export const STAFF_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.FINANCE,
  USER_ROLES.VOLUNTEER,
];

/**
 * Daftar email akun pengembang / vendor teknis eksternal yang dikecualikan
 * dari struktur kepengurusan publik yayasan.
 */
export const EXCLUDED_LEADERSHIP_EMAILS = [
  "zakiram4dhan@gmail.com",
  "piscokpiscok2610@gmail.com",
  "zakiram4dhan.works@gmail.com",
];

/**
 * Kata kunci jabatan teknis non-struktural yang otomatis dikecualikan
 * dari tampilan publik struktur organisasi (/tentang-kami).
 */
export const NON_STRUCTURAL_TECH_KEYWORDS = [
  "admin web",
  "pengelola web",
  "webmaster",
  "it support",
  "staf it",
  "staff it",
  "developer",
  "programmer",
  "teknisi sistem",
  "super admin",
  "superadmin",
  "super_admin",
];

/**
 * Mengecek apakah suatu jabatan tergolong teknis non-struktural
 * sehingga tidak boleh ditampilkan di jajaran pengurus publik.
 *
 * @param {string|null} title
 * @returns {boolean}
 */
export function isNonStructuralTechTitle(title) {
  if (!title || typeof title !== "string") return true;
  const clean = title.trim().toLowerCase();
  return NON_STRUCTURAL_TECH_KEYWORDS.some((kw) => clean === kw || clean.startsWith(`${kw} `) || clean.endsWith(` ${kw}`));
}

/**
 * Mengambil daftar email yang dikecualikan dari struktur organisasi publik.
 * Menggabungkan daftar preset bawaan dan variabel lingkungan EXCLUDED_LEADERSHIP_EMAILS bila ada.
 *
 * @returns {string[]}
 */
export function getExcludedLeadershipEmails() {
  const envEmails = process.env.EXCLUDED_LEADERSHIP_EMAILS
    ? process.env.EXCLUDED_LEADERSHIP_EMAILS.split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return Array.from(
    new Set([
      ...EXCLUDED_LEADERSHIP_EMAILS.map((e) => e.toLowerCase()),
      ...envEmails,
    ])
  );
}


/**
 * Opsi tingkat hak akses yang ramah bagi admin awam.
 */
export const STAFF_ACCESS_ROLES = [
  {
    value: USER_ROLES.ADMIN,
    label: "Admin yayasan",
    description: "Pengelolaan kampanye program, penyaluran, artikel edukasi, dan operasional harian.",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: USER_ROLES.FINANCE,
    label: "Admin keuangan",
    description: "Rekonsiliasi transaksi ZISWAF, mutasi kas perbankan, dan laporan pertanggungjawaban.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: USER_ROLES.VOLUNTEER,
    label: "Relawan lapangan",
    description: "Presensi kegiatan, distribusi bantuan di lapangan, dan pemutakhiran data mustahik.",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: USER_ROLES.SUPER_ADMIN,
    label: "Super admin",
    description: "Akses menyeluruh terhadap seluruh sistem, konfigurasi legalitas yayasan, dan kelola staf pengurus.",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

/**
 * Opsi pilihan jenis kelamin untuk penentuan avatar otomatis.
 */
export const GENDER_OPTIONS = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" },
];

/**
 * Path avatar SVG resmi bawaan berdasarkan jenis kelamin.
 */
export const DEFAULT_STAFF_AVATARS = {
  MALE: "/img/avatars/avatar-male.svg",
  FEMALE: "/img/avatars/avatar-female.svg",
};

/**
 * Menyelesaikan URL avatar pengurus: menggunakan avatar kustom bila ada,
 * atau avatar SVG proporsional sesuai jenis kelamin.
 *
 * @param {string|null} avatar
 * @param {string|null} gender
 * @returns {string}
 */
export function resolveStaffAvatar(avatar, gender = "MALE") {
  const normalizedGender = String(gender || "").toUpperCase();
  const isFemale =
    normalizedGender === "FEMALE" ||
    normalizedGender === "P" ||
    normalizedGender === "PEREMPUAN";
  const defaultSvg = isFemale ? DEFAULT_STAFF_AVATARS.FEMALE : DEFAULT_STAFF_AVATARS.MALE;

  if (!avatar || typeof avatar !== "string" || avatar.trim().length === 0) {
    return defaultSvg;
  }

  const cleanAvatar = avatar.trim();
  // Jika avatar masih menggunakan SVG bawaan, pastikan selalu sinkron dengan jenis kelamin terkini
  if (
    cleanAvatar === DEFAULT_STAFF_AVATARS.MALE ||
    cleanAvatar === DEFAULT_STAFF_AVATARS.FEMALE
  ) {
    return defaultSvg;
  }

  return cleanAvatar;
}

/**
 * Daftar rekomendasi jabatan struktural standar yayasan untuk saran awal combobox.
 */
export const DEFAULT_STRUCTURAL_TITLES = [
  "Ketua Dewan Pembina",
  "Anggota Dewan Pembina",
  "Dewan Pengawas",
  "Ketua Yayasan",
  "Sekretaris",
  "Bendahara",
  "Kepala Divisi Program & Operasional",
  "Koordinator Relawan Lapangan",
  "Staf Verifikasi Kas & Donasi",
  "Staf Media & Publikasi",
];

/**
 * Bobot urutan hierarki struktural agar pengurus tertata rapi di halaman publik.
 */
export const TITLE_HIERARCHY_ORDER = {
  "ketua dewan pembina": 1,
  "anggota dewan pembina": 2,
  "dewan pembina": 2,
  "penasihat": 2,
  "dewan pengawas": 3,
  "pengawas": 3,
  "ketua yayasan": 4,
  "wakil ketua yayasan": 5,
  "sekretaris": 6,
  "bendahara": 7,
  "kepala divisi program & operasional": 8,
  "koordinator relawan lapangan": 9,
  "staf operasional": 10,
};
