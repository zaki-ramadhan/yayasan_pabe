import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../src/data/categories.js";
import { ARTICLES, validateArticleCategories } from "../src/data/articles.js";
import { YATIM_BENEFICIARIES, DHUAFA_LANSIA_BENEFICIARIES } from "../src/data/beneficiaries.js";
import { ORG_PROFILE } from "../src/data/orgProfile.js";
import { CAREER_VACANCIES } from "../src/data/careers.js";
import { FAQS } from "../src/data/faqs.js";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const REAL_PROGRAMS = [
  {
    id: "camp-001",
    slug: "beasiswa-santri-penghafal-quran",
    title: "Bimbel PABE Smart & Beasiswa Belajar 98 Anak Yatim Piatu",
    categoryId: "pendidikan",
    targetAmount: 150000000,
    isUrgent: false,
    isFeatured: true,
    location: "Cakung, Jakarta Timur",
    bannerUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    excerpt: "Bimbingan belajar sekolah, literasi digital komputer, kursus bahasa, dan TPA Al-Qur'an gratis bagi 98 anak yatim binaan Yayasan Payung Berkah.",
    story: "Pendidikan adalah bekal utama kemandirian masa depan anak-anak yatim. Di bawah naungan Yayasan Payung Berkah (PABE) yang berpusat di Cakung, Jakarta Timur, terdapat 98 anak yatim piatu binaan yang memperoleh akses belajar gratis dan pelatihan keterampilan hidup.\n\nFokus program Bimbel PABE Smart meliputi:\n1. Bimbingan belajar akademis gratis jenjang SD, SMP, hingga SMA.\n2. Pembelajaran literasi komputer dasar dan keterampilan digital.\n3. Kursus Bahasa Inggris dan Bahasa Arab bersama para tutor relawan.\n4. Pembinaan Taman Pendidikan Al-Qur'an (TPA) dan hafalan surat-surat pilihan.\n\nMari bersama lahirkan generasi cerdas, berakhlak mulia, dan mandiri demi menyongsong masa depan yang sejahtera.",
    updates: [
      {
        id: "upd-001",
        title: "Penyaluran Paket Modul Belajar & Fasilitas Bimbel PABE Smart",
        content: "Alhamdulillah, dana sebesar Rp 25.000.000 telah disalurkan untuk pengadaan modul belajar, sarana meja tulis, dan perlengkapan kelas Bimbel PABE Smart bagi adik-adik yatim di Rawa Bebek, Cakung.",
        disbursedAmount: 25000000,
        date: new Date("2025-11-15T10:00:00Z"),
        images: ["https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"],
      },
      {
        id: "upd-002",
        title: "Wisuda Bimbingan Tahfidz Juz 'Amma & Apresiasi Juara Kelas",
        content: "Apresiasi prestasi untuk anak-anak yatim berprestasi di sekolah formal dan kelulusan hafalan Juz 'Amma santri TPA Yayasan Payung Berkah.",
        disbursedAmount: 18000000,
        date: new Date("2026-02-20T14:00:00Z"),
        images: ["https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"],
      },
      {
        id: "upd-003",
        title: "Penyaluran Paket Seragam Sekolah & Alat Tulis Semester Baru",
        content: "Distribusi perlengkapan sekolah lengkap untuk 98 anak yatim binaan menyambut tahun ajaran baru.",
        disbursedAmount: 21500000,
        date: new Date("2026-07-10T09:00:00Z"),
        images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-002",
    slug: "santunan-bulanan-yatim-dhuafa",
    title: "Santunan Rutin Bulanan & Paket Sembako Yatim Dhuafa Cakung",
    categoryId: "yatim",
    targetAmount: 120000000,
    isUrgent: true,
    isFeatured: true,
    location: "Pulo Gebang, Jakarta Timur",
    bannerUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    excerpt: "Bantuan biaya hidup rutin dan pemenuhan gizi pokok setiap bulan untuk 98 anak yatim dan 34 keluarga dhuafa di Rawa Bebek.",
    story: "Setiap bulan, Yayasan Payung Berkah menyalurkan santunan tunai operasional dan paket sembako nutrisi guna menjamin kebutuhan pokok anak-anak yatim binaan tetap terpenuhi.",
    updates: [
      {
        id: "upd-004",
        title: "Penyaluran Santunan Uang Saku & Sembako Awal Bulan",
        content: "Penyaluran santunan tunai kepada 98 anak yatim binaan dan paket sembako untuk lansia dhuafa di Sekretariat Yayasan Cakung.",
        disbursedAmount: 32000000,
        date: new Date("2026-01-05T10:00:00Z"),
        images: ["https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"],
      },
      {
        id: "upd-005",
        title: "Penyaluran Santunan Beras & Nutrisi Protein Balita",
        content: "Alhamdulillah santunan pangan pokok beras 10kg dan paket susu serta telur telah diserahkan.",
        disbursedAmount: 28500000,
        date: new Date("2026-04-12T11:00:00Z"),
        images: ["https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-003",
    slug: "layanan-kesehatan-akupresur-lansia",
    title: "Pelayanan Medis Gratis & Terapi Akupresur 34 Lansia Dhuafa",
    categoryId: "dhuafa",
    targetAmount: 80000000,
    isUrgent: false,
    isFeatured: true,
    location: "Kecamatan Cakung, Jakarta Timur",
    bannerUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
    excerpt: "Pemeriksaan kesehatan berkala, tensi, gula darah, terapi akupresur tradisional, dan penyediaan obat-obatan gratis bagi lansia dhuafa.",
    story: "Kesehatan di usia senja adalah hak setiap insan. Yayasan Payung Berkah menghadirkan layanan medis gratis dan terapi fisik akupresur bekerja sama dengan tenaga kesehatan relawan.",
    updates: [
      {
        id: "upd-006",
        title: "Medical Check-Up Akbar & Terapi Akupresur Lansia",
        content: "Pemeriksaan kesehatan komprehensif bagi 34 lansia binaan di balai warga RW 01 Pulo Gebang Cakung.",
        disbursedAmount: 18500000,
        date: new Date("2026-03-15T08:30:00Z"),
        images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-004",
    slug: "sedekah-subuh-beras-santri",
    title: "Sedekah Subuh: Pasokan Beras & Pangan Santri Penghafal Qur'an",
    categoryId: "zakat",
    targetAmount: 60000000,
    isUrgent: false,
    isFeatured: false,
    location: "Jakarta Timur & Sekitarnya",
    bannerUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
    excerpt: "Penyaluran sedekah subuh harian untuk mencukupi kebutuhan makan sehat bergizi para santri tahfidz dan anak asuh yayasan.",
    story: "Awali pagi dengan doa malaikat yang mustajab melalui sedekah subuh. Dana yang terkumpul dialokasikan untuk beras premium dan lauk pauk bergizi para santri.",
    updates: [
      {
        id: "upd-007",
        title: "Pengadaan 1 Ton Beras Lumbung Pangan Santri",
        content: "Alhamdulillah 1 ton beras berkualitas telah didistribusikan ke dapur umum yayasan.",
        disbursedAmount: 14500000,
        date: new Date("2026-05-02T13:00:00Z"),
        images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-005",
    slug: "wakaf-sarana-belajar-komputer",
    title: "Wakaf Fasilitas Komputer & Literasi Digital Santri PABE Smart",
    categoryId: "pendidikan",
    targetAmount: 95000000,
    isUrgent: false,
    isFeatured: false,
    location: "Cakung, Jakarta Timur",
    bannerUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    excerpt: "Pengadaan 15 unit komputer PC dan akses internet edukasi untuk laboratorium belajar adik-adik yatim di Rawa Bebek.",
    story: "Menyiapkan generasi muda yang tangguh teknologi. Program ini membuka akses kursus komputer, coding dasar, dan desain grafis bagi santri binaan.",
    updates: [
      {
        id: "upd-008",
        title: "Instalasi 8 Unit Komputer Tahap Pertama & Meja Lab",
        content: "Perakitan komputer dan instalasi jaringan internet telah selesai dan siap digunakan kelas bimbingan komputer.",
        disbursedAmount: 38000000,
        date: new Date("2026-06-18T16:00:00Z"),
        images: ["https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-006",
    slug: "tanggap-bencana-logistik-darurat",
    title: "Payung Berkah Peduli: Aksi Tanggap Darurat & Bantuan Logistik",
    categoryId: "bencana",
    targetAmount: 100000000,
    isUrgent: true,
    isFeatured: false,
    location: "Wilayah Terdampak Bencana",
    bannerUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    excerpt: "Penyaluran logistik darurat, air bersih, tenda pengungsian, dan hygiene kit bagi masyarakat yang tertimpa musibah bencana alam.",
    story: "Ketika bencana melanda, kecepatan bantuan adalah penyelamat jiwa. Tim relawan Payung Berkah Peduli sigap menyalurkan logistik langsung ke titik pengungsian terisolasi.",
    updates: [
      {
        id: "upd-009",
        title: "Distribusi 300 Paket Makanan Siap Santap & Selimut",
        content: "Aksi cepat relawan lapangan menyerahkan bantuan darurat bagi warga terdampak genangan banjir.",
        disbursedAmount: 22000000,
        date: new Date("2026-02-10T11:00:00Z"),
        images: ["https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-007",
    slug: "pemberdayaan-ekonomi-keluarga-yatim",
    title: "Pelatihan Keterampilan & Modal Usaha Mandiri Ibu Yatim",
    categoryId: "ekonomi",
    targetAmount: 75000000,
    isUrgent: false,
    isFeatured: false,
    location: "Cakung, Jakarta Timur",
    bannerUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80",
    excerpt: "Pemberdayaan ekonomi ibu tunggal (wali yatim) berupa pelatihan tata boga, menjahit, dan pendampingan modal usaha mikro.",
    story: "Kemandirian ekonomi keluarga yatim adalah pilar ketahanan generasi. Melalui program ini, para ibu tunggal dibekali keahlian wirausaha mandiri.",
    updates: [
      {
        id: "upd-010",
        title: "Penyerahan Modal Usaha dan Alat Memasak bagi 15 Ibu Wali Yatim",
        content: "Penyaluran paket modal bergulir tanpa bunga untuk usaha kuliner rumahan.",
        disbursedAmount: 20000000,
        date: new Date("2026-08-01T15:00:00Z"),
        images: ["https://images.unsplash.com/photo-1556742049-0a67e557223b?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
  {
    id: "camp-008",
    slug: "zakat-penghasilan-asnaf-mustahik",
    title: "Optimalisasi Zakat Maal & Zakat Penghasilan untuk 8 Asnaf",
    categoryId: "zakat",
    targetAmount: 200000000,
    isUrgent: false,
    isFeatured: true,
    location: "DKI Jakarta & Nasional",
    bannerUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    excerpt: "Pengelolaan dana zakat fitrah, maal, dan profesi secara profesional, akuntabel, dan sesuai syariat Islam.",
    story: "Tunaikan kewajiban zakat penghasilan Anda untuk membersihkan harta dan menyucikan jiwa. Disalurkan tepat sasaran kepada para mustahik 8 asnaf di wilayah binaan.",
    updates: [
      {
        id: "upd-011",
        title: "Penyaluran Zakat Maal Tahap I kepada 50 Kepala Keluarga Fakir Miskin",
        content: "Alhamdulillah dana zakat telah diserahkan langsung secara tertib dan transparan.",
        disbursedAmount: 45000000,
        date: new Date("2026-04-20T10:30:00Z"),
        images: ["https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"],
      },
    ],
  },
];

const KNOWN_DONORS = [
  { name: "Ahmad Fauzi", email: "ahmad.fauzi@gmail.com", phone: "081298765432", salutation: "Bpk." },
  { name: "Siti Rahmawati", email: "siti.rahmawati@yahoo.co.id", phone: "081387654321", salutation: "Ibu" },
  { name: "dr. Maya Anggraini", email: "maya.anggraini@rs-sehat.co.id", phone: "081123456789", salutation: "dr." },
  { name: "H. Hendra Wijaya", email: "hendra.wijaya@holding.co.id", phone: "081234567801", salutation: "H." },
  { name: "Dewi Lestari", email: "dewi.lestari@gmail.com", phone: "081765432109", salutation: "Ibu" },
  { name: "Muhammad Rizky", email: "m.rizky@gmail.com", phone: "081876543210", salutation: "Bpk." },
  { name: "Agus Pratama", email: "agus.pratama@outlook.com", phone: "081987654321", salutation: "Bpk." },
  { name: "Keluarga Ibu Sri", email: "sri.mulyani88@gmail.com", phone: "081233445566", salutation: "Ibu" },
  { name: "Farhan Maulana", email: "farhan.m@gmail.com", phone: "085612345678", salutation: "Bpk." },
  { name: "Keluarga Bpk. Sukardi", email: "sukardi.family@yahoo.com", phone: "081755667788", salutation: "Bpk." },
  { name: "Nurul Aini", email: "nurul.aini@sekolah.id", phone: "081399887766", salutation: "Ibu" },
  { name: "Eko Prasetyo", email: "eko.prasetyo@pt-karya.co.id", phone: "081288776655", salutation: "Bpk." },
  { name: "Wahyu Hidayat", email: "wahyu.hidayat@gmail.com", phone: "081577665544", salutation: "Bpk." },
  { name: "dr. Tirta Wijaya", email: "tirta.w@klinik.co.id", phone: "081266554433", salutation: "dr." },
  { name: "Rina Kartika", email: "rina.kartika@gmail.com", phone: "081855443322", salutation: "Ibu" },
];

const PRAYERS_POOL = [
  "Semoga berkah untuk adik-adik santri dan anak-anak yatim.",
  "Bismillah semoga menjadi pembuka pintu rezeki dan kesehatan sekeluarga.",
  "Pahala sedekah ini kami niatkan khusus untuk almarhum kedua orang tua kami tercinta. Aamiin.",
  "Semoga anak-anak binaan yayasan tumbuh menjadi generasi sholeh, cerdas, dan mandiri.",
  "Ya Allah lapangkanlah rezeki kami, sembuhkanlah keluarga kami yang sedang sakit.",
  "Semoga program bimbingan belajar PABE Smart lancar dan melahirkan banyak santri berprestasi.",
  "Alhamdulillah semoga sedekah subuh ini membawa ketenangan dan keberkahan hidup.",
  "Semoga para pengurus dan relawan yayasan selalu diberikan keistiqomahan dalam berkhidmat.",
  "Doa terbaik untuk kelancaran pembangunan fasilitas belajar anak yatim.",
  "Bismillah istiqomah berbagi kebaikan setiap pekan.",
];

const PAYMENT_CHANNELS_POOL = ["QRIS", "BCA_VA", "MANDIRI_VA", "BRI_VA", "BSI_VA"];

async function main() {
  console.log("🚀 Memulai Master Database Seeding (PostgreSQL)...");

  // 1. Seed OrgSetting
  console.log("🏢 1. Menyimpan Profil & Legalitas Resmi Yayasan (OrgSetting)...");
  await prisma.orgSetting.upsert({
    where: { id: "org_profile" },
    update: {
      name: ORG_PROFILE.name,
      shortName: ORG_PROFILE.shortName,
      tagline: ORG_PROFILE.tagline,
      legalSk: ORG_PROFILE.legal.skKemenkumham,
      npwp: ORG_PROFILE.legal.npwp,
      izinSosial: ORG_PROFILE.legal.izinIzinSosial,
      address: ORG_PROFILE.contacts.address,
      phone: ORG_PROFILE.contacts.phone,
      whatsapp: ORG_PROFILE.contacts.whatsapp,
      email: ORG_PROFILE.contacts.email,
      officeHours: ORG_PROFILE.contacts.officeHours,
      bankAccounts: ORG_PROFILE.officialBankAccounts,
      vision: ORG_PROFILE.vision,
      missions: ORG_PROFILE.missions,
    },
    create: {
      id: "org_profile",
      name: ORG_PROFILE.name,
      shortName: ORG_PROFILE.shortName,
      tagline: ORG_PROFILE.tagline,
      legalSk: ORG_PROFILE.legal.skKemenkumham,
      npwp: ORG_PROFILE.legal.npwp,
      izinSosial: ORG_PROFILE.legal.izinIzinSosial,
      address: ORG_PROFILE.contacts.address,
      phone: ORG_PROFILE.contacts.phone,
      whatsapp: ORG_PROFILE.contacts.whatsapp,
      email: ORG_PROFILE.contacts.email,
      officeHours: ORG_PROFILE.contacts.officeHours,
      bankAccounts: ORG_PROFILE.officialBankAccounts,
      vision: ORG_PROFILE.vision,
      missions: ORG_PROFILE.missions,
    },
  });

  // 2. Seed Users (Admins, Staff, and Registered Donors)
  console.log("👥 2. Menanam Akun Pengguna & Donatur Terdaftar (User)...");
  const defaultPassword = "AdminPABE2026!";
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(defaultPassword, salt, 64).toString("hex");
  const defaultPasswordHash = `${salt}:${derived}`;

  const staffUsers = [
    {
      name: "Drs. H. M. Fauzan, M.Pd",
      email: "superadmin@pabe.or.id",
      username: "superadmin",
      role: "SUPER_ADMIN",
      title: "Super Admin",
      salutation: "Bpk.",
      city: "Jakarta Timur",
      phone: "081122334455",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Suko Pranoto",
      email: "superadmin@yayasanpayungberkah.org",
      username: "superadmin_pabe",
      role: "SUPER_ADMIN",
      title: "Ketua Dewan Pembina",
      salutation: "Bpk.",
      city: "Jakarta Timur",
      phone: "081284079912",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Admin Utama PABE",
      email: "admin@payungberkah.or.id",
      username: "admin",
      role: "SUPER_ADMIN",
      title: "Super Admin",
      salutation: "Bpk.",
      city: "Jakarta Timur",
      phone: "081299887766",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Ust. Rian Ramadhan",
      email: "admin.program@pabe.or.id",
      username: "admin.program",
      role: "ADMIN",
      title: "Kepala Divisi Program & Operasional",
      salutation: "Ust.",
      city: "Jakarta Timur",
      phone: "081233445566",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Yuni Marlina, S.Pd.I.",
      email: "admin@yayasanpayungberkah.org",
      username: "admin_pabe",
      role: "ADMIN",
      title: "Ketua Yayasan",
      salutation: "Ibu",
      city: "Jakarta Timur",
      phone: "081285109476",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Hj. Annisa Fitriani, S.E., Ak.",
      email: "finance@pabe.or.id",
      username: "finance",
      role: "FINANCE",
      title: "Bendahara & Rekonsiliasi ZISWAF",
      salutation: "Hj.",
      city: "Jakarta Timur",
      phone: "081344556677",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Sarini",
      email: "finance@yayasanpayungberkah.org",
      username: "finance_pabe",
      role: "FINANCE",
      title: "Bendahara Yayasan",
      salutation: "Ibu",
      city: "Jakarta Timur",
      phone: "081238857042",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Bagas Pratama",
      email: "bagas.relawan@gmail.com",
      username: "bagas.relawan",
      role: "VOLUNTEER",
      title: "Koordinator Relawan Lapangan",
      salutation: "Sdr.",
      city: "Jakarta Timur",
      phone: "081455667788",
      passwordHash: defaultPasswordHash,
    },
    {
      name: "Shofi Hidayatullah Akbar, S.Ag.",
      email: "relawan@yayasanpayungberkah.org",
      username: "relawan_pabe",
      role: "VOLUNTEER",
      title: "Sekretaris & Koordinator",
      salutation: "Bpk.",
      city: "Jakarta Timur",
      phone: "081284079913",
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const staff of staffUsers) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: staff.email }, { username: staff.username }],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: staff.name,
          role: staff.role,
          title: staff.title,
          salutation: staff.salutation,
          city: staff.city,
          phone: staff.phone,
          passwordHash: staff.passwordHash,
        },
      });
    } else {
      await prisma.user.create({ data: staff });
    }
  }

  for (const donor of KNOWN_DONORS) {
    const existing = await prisma.user.findFirst({
      where: { email: donor.email },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: donor.name,
          phone: donor.phone,
          title: "Donatur Terdaftar",
          salutation: donor.salutation,
          city: "Jakarta Timur",
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          role: "DONOR",
          title: "Donatur Terdaftar",
          salutation: donor.salutation,
          city: "Jakarta Timur",
        },
      });
    }
  }


  // 3. Seed Beneficiaries (132 Real Binaan)
  console.log("🧒 3. Menanam 132 Penerima Manfaat Riil Binaan Cakung (Beneficiary)...");
  for (const item of YATIM_BENEFICIARIES) {
    await prisma.beneficiary.upsert({
      where: { code: item.id },
      update: {
        name: item.name,
        gender: item.gender,
        category: "YATIM",
        program: item.program,
        location: item.location,
      },
      create: {
        code: item.id,
        name: item.name,
        gender: item.gender,
        category: "YATIM",
        program: item.program,
        location: item.location,
      },
    });
  }

  for (const item of DHUAFA_LANSIA_BENEFICIARIES) {
    await prisma.beneficiary.upsert({
      where: { code: item.id },
      update: {
        name: item.name,
        gender: item.gender,
        category: "LANSIA_DHUAFA",
        program: item.program,
        location: item.location,
      },
      create: {
        code: item.id,
        name: item.name,
        gender: item.gender,
        category: "LANSIA_DHUAFA",
        program: item.program,
        location: item.location,
      },
    });
  }

  // 4. Seed Categories
  console.log("📁 4. Menanam Kategori Master (Category)...");
  const validCategories = CATEGORIES.filter((c) => c.id !== "all");
  for (const cat of validCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      },
    });
  }

  // 5. Seed Campaigns, Updates & Dynamic Real Donations
  console.log("🎯 5. Menanam Program Campaign, Update Distribusi & Ratusan Mutasi Donasi...");
  
  // Clean existing dependent tables to re-seed fresh relational data
  await prisma.donation.deleteMany({});
  await prisma.campaignUpdate.deleteMany({});
  await prisma.routineDonation.deleteMany({});
  await prisma.campaign.deleteMany({});

  const timelineStart = new Date("2025-06-01T08:00:00Z").getTime();
  const timelineEnd = new Date("2026-10-24T18:00:00Z").getTime();
  const timeSpan = timelineEnd - timelineStart;

  let globalInvoiceSeq = 1000;

  for (const prog of REAL_PROGRAMS) {
    const createdCampaign = await prisma.campaign.create({
      data: {
        id: prog.id,
        title: prog.title,
        slug: prog.slug,
        categoryId: prog.categoryId === "dhuafa" ? "yatim" : prog.categoryId,
        targetAmount: prog.targetAmount,
        collectedAmount: 0,
        donorCount: 0,
        endDate: new Date("2026-12-31T23:59:59Z"),
        status: "ACTIVE",
        isUrgent: prog.isUrgent,
        isFeatured: prog.isFeatured,
        location: prog.location,
        excerpt: prog.excerpt,
        story: prog.story,
        bannerUrl: prog.bannerUrl,
      },
    });


    // Seed updates
    for (const upd of prog.updates) {
      await prisma.campaignUpdate.create({
        data: {
          id: upd.id,
          campaignId: createdCampaign.id,
          title: upd.title,
          content: upd.content,
          disbursedAmount: upd.disbursedAmount,
          approvalStatus: "APPROVED",
          approvedBy: "Yuni Marlina, S.Pd.I.",
          approvedAt: upd.date,
          date: upd.date,
          images: upd.images,
        },
      });
    }

    // Generate 35 - 65 realistic donations per campaign
    const numDonations = 35 + Math.floor(Math.random() * 30);
    const donationsToCreate = [];
    let campaignCollected = 0;
    let campaignDonorCount = 0;

    for (let i = 0; i < numDonations; i++) {
      globalInvoiceSeq++;
      const isPaid = Math.random() < 0.88;
      const isAnon = Math.random() < 0.35;
      
      const donorProfile = KNOWN_DONORS[i % KNOWN_DONORS.length];
      const donorName = isAnon ? "Hamba Allah" : donorProfile.name;
      const donorEmail = isAnon ? null : donorProfile.email;
      const donorPhone = isAnon ? "081234567890" : donorProfile.phone;

      // Realistic amounts
      const amounts = [25000, 50000, 50000, 100000, 100000, 150000, 200000, 250000, 500000, 1000000];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const uniqueCode = Math.floor(Math.random() * 499) + 1;
      const channel = PAYMENT_CHANNELS_POOL[i % PAYMENT_CHANNELS_POOL.length];

      // Time spread across timeline
      const tRatio = (i + 1) / numDonations;
      const donationTime = new Date(timelineStart + tRatio * timeSpan);
      const expiredAt = new Date(donationTime.getTime() + 24 * 3600 * 1000);

      const hasPrayer = Math.random() < 0.65;
      const prayer = hasPrayer ? PRAYERS_POOL[i % PRAYERS_POOL.length] : null;
      const aminCount = hasPrayer && isPaid ? Math.floor(Math.random() * 25) + 2 : 0;

      const status = isPaid ? "PAID" : (donationTime.getTime() > timelineEnd - 86400000 ? "PENDING" : "EXPIRED");

      if (status === "PAID") {
        campaignCollected += amount;
        campaignDonorCount += 1;
      }

      donationsToCreate.push({
        invoiceId: `INV-${new Date(donationTime).getFullYear()}${String(new Date(donationTime).getMonth() + 1).padStart(2, "0")}-${globalInvoiceSeq}`,
        campaignId: createdCampaign.id,
        donationType: prog.categoryId === "zakat" ? "ZAKAT" : "CAMPAIGN",
        amount,
        uniqueCode: channel.includes("VA") ? 0 : uniqueCode,
        totalAmount: channel.includes("VA") ? amount : (amount + uniqueCode),
        paymentChannel: channel,
        paymentRef: `REF-${channel}-${globalInvoiceSeq}`,
        donorName,
        donorEmail,
        donorPhone,
        isAnonymous: isAnon,
        prayer,
        aminCount,
        status,
        paidAt: status === "PAID" ? donationTime : null,
        expiredAt,
        createdAt: donationTime,
      });
    }

    // Insert donations
    await prisma.donation.createMany({ data: donationsToCreate });

    // Update campaign with actual aggregated figures
    await prisma.campaign.update({
      where: { id: createdCampaign.id },
      data: {
        collectedAmount: campaignCollected,
        donorCount: campaignDonorCount,
      },
    });
  }

  // 6. Seed Routine Donations
  console.log("⏰ 6. Menanam Jadwal Komitmen Donasi Rutin (RoutineDonation)...");
  await prisma.routineDonation.deleteMany({});
  const routinePresets = [
    {
      donorName: "Ahmad Fauzi",
      donorEmail: "ahmad.fauzi@gmail.com",
      donorPhone: "081298765432",
      programTitle: "Bimbel PABE Smart & Beasiswa Belajar 98 Anak Yatim Piatu",
      amount: 100000,
      frequency: "MONTHLY",
      routineType: "AUTO_DONATION",
      status: "ACTIVE",
      reminderTime: "07:00",
    },
    {
      donorName: "Siti Rahmawati",
      donorEmail: "siti.rahmawati@yahoo.co.id",
      donorPhone: "081387654321",
      programTitle: "Sedekah Subuh: Pasokan Beras & Pangan Santri Penghafal Qur'an",
      amount: 25000,
      frequency: "DAILY",
      routineType: "REMINDER_ONLY",
      status: "ACTIVE",
      reminderTime: "04:30",
    },
    {
      donorName: "H. Hendra Wijaya",
      donorEmail: "hendra.wijaya@holding.co.id",
      donorPhone: "081234567801",
      programTitle: "Santunan Rutin Bulanan & Paket Sembako Yatim Dhuafa Cakung",
      amount: 500000,
      frequency: "MONTHLY",
      routineType: "AUTO_DONATION",
      status: "ACTIVE",
      reminderTime: "08:00",
    },
    {
      donorName: "Dewi Lestari",
      donorEmail: "dewi.lestari@gmail.com",
      donorPhone: "081765432109",
      programTitle: "Pelayanan Medis Gratis & Terapi Akupresur 34 Lansia Dhuafa",
      amount: 50000,
      frequency: "WEEKLY",
      routineType: "AUTO_DONATION",
      selectedDay: "jumat",
      status: "ACTIVE",
      reminderTime: "05:00",
    },
    {
      donorName: "Hamba Allah",
      donorEmail: null,
      donorPhone: "081234567899",
      programTitle: "Sedekah Subuh: Pasokan Beras & Pangan Santri Penghafal Qur'an",
      amount: 15000,
      frequency: "DAILY",
      routineType: "REMINDER_ONLY",
      status: "ACTIVE",
      isAnonymous: true,
      reminderTime: "04:45",
    },
  ];

  for (const rout of routinePresets) {
    await prisma.routineDonation.create({ data: rout });
  }

  // 7. Seed Volunteers
  console.log("🤝 7. Menanam Data Pendaftar Relawan (Volunteer)...");
  await prisma.volunteer.deleteMany({});
  const volunteerSeeds = [
    {
      fullName: "Muhammad Farhan Hakim",
      email: "farhan.hakim@gmail.com",
      phone: "081287654320",
      city: "Jakarta Timur",
      interest: "Pengajar & Pembimbing Al-Qur'an",
      motivation: "Ingin mengamalkan ilmu tahsin Al-Qur'an dan mengabdi untuk adik-adik yatim di Cakung.",
      status: "APPROVED",
      createdAt: new Date("2026-01-14T09:00:00Z"),
    },
    {
      fullName: "Nurul Aini, S.Pd.",
      email: "nurul.aini@guru.org",
      phone: "081399887711",
      city: "Bekasi",
      interest: "Pengajar Bimbel Akademis",
      motivation: "Berpengalaman mengajar Matematika SD & SMP, siap menjadi tutor relawan Bimbel PABE Smart.",
      status: "APPROVED",
      createdAt: new Date("2026-02-05T11:30:00Z"),
    },
    {
      fullName: "dr. Dimas Prasetya",
      email: "dimas.prasetya@medis.id",
      phone: "081155443322",
      city: "Jakarta Selatan",
      interest: "Layanan Medis & Pengobatan",
      motivation: "Siap membantu pemeriksaan kesehatan berkala lansia dan tensi darah cuma-cuma.",
      status: "APPROVED",
      createdAt: new Date("2026-03-12T14:15:00Z"),
    },
    {
      fullName: "Rizky Ramadhan",
      email: "rizky.ramadhan@kreatif.com",
      phone: "085612347890",
      city: "Jakarta Timur",
      interest: "Dokumentasi & Media Sosial",
      motivation: "Membantu pembuatan video liputan kegiatan penyaluran agar transparansi yayasan semakin baik.",
      status: "APPROVED",
      createdAt: new Date("2026-04-18T10:00:00Z"),
    },
    {
      fullName: "Annisa Rahmawati",
      email: "annisa.rahma@student.ui.ac.id",
      phone: "081788990011",
      city: "Depok",
      interest: "Distribusi Logistik & Bantuan Sosial",
      motivation: "Ingin berkontribusi nyata saat aksi tanggap bencana dan pembagian sembako bulanan.",
      status: "CONTACTED",
      createdAt: new Date("2026-05-20T16:00:00Z"),
    },
    {
      fullName: "Budi Santoso",
      email: "budi.santoso.it@gmail.com",
      phone: "081233441122",
      city: "Jakarta Pusat",
      interest: "Pengajar Komputer & IT",
      motivation: "Siap mengajarkan dasar komputer dan office untuk santri binaan PABE Smart.",
      status: "PENDING",
      createdAt: new Date("2026-08-10T13:40:00Z"),
    },
  ];

  for (const vol of volunteerSeeds) {
    await prisma.volunteer.create({ data: vol });
  }

  // 8. Seed Job Vacancies & Applications
  console.log("💼 8. Menanam Lowongan Kerja & Pelamar (JobVacancy & JobApplication)...");
  await prisma.jobApplication.deleteMany({});
  await prisma.jobVacancy.deleteMany({});

  for (const vac of CAREER_VACANCIES) {
    const createdVac = await prisma.jobVacancy.create({
      data: {
        jobCode: vac.id,
        title: vac.title,
        department: vac.department,
        location: vac.location,
        type: vac.type,
        workplace: vac.workplace || "On-site",
        experience: vac.experience || "1 - 3 tahun",
        publishedDate: vac.publishedDate || "2026-01-10",
        deadline: vac.deadline || "31 Desember 2026",
        overview: vac.overview,
        responsibilities: vac.responsibilities || [],
        requirements: vac.requirements || [],
        benefits: vac.benefits || [],
        applyUrl: null, // Direct portal apply
        isActive: true,
      },
    });

    // Seed realistic applicants for the first vacancy
    if (vac.id === "JOB-01") {
      await prisma.jobApplication.createMany({
        data: [
          {
            vacancyId: createdVac.id,
            fullName: "Ilham Ramadhan, S.Sos.",
            email: "ilham.ramadhan@gmail.com",
            phone: "081234567812",
            coverLetter: "Saya memiliki pengalaman 2 tahun di bidang pendistribusian logistik bantuan sosial lembaga nirlaba.",
            status: "REVIEWED",
            createdAt: new Date("2026-03-01T10:00:00Z"),
          },
          {
            vacancyId: createdVac.id,
            fullName: "Fadhilah Putri, S.E.",
            email: "fadhilah.putri@yahoo.com",
            phone: "085698761234",
            coverLetter: "Berminat tinggi mengabdi di divisi program dan pemberdayaan masyarakat Yayasan Payung Berkah.",
            status: "SHORTLISTED",
            createdAt: new Date("2026-03-05T14:30:00Z"),
          },
        ],
      });
    }
  }

  // 9. Seed FAQs
  console.log("❓ 9. Menanam Tanya Jawab Resmi (Faq)...");
  await prisma.faq.deleteMany({});
  for (const faq of FAQS) {
    await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "Umum",
        order: faq.order || 0,
        isActive: faq.isActive ?? true,
      },
    });
  }

  // 10. Seed Audit Reports (Realistic Proportionate Scale)
  console.log("📑 10. Menanam Laporan Audit Keuangan Proporsional (AuditReport)...");
  await prisma.auditReport.deleteMany({});
  const auditSeeds = [
    {
      id: "rep-2025",
      year: 2025,
      title: "Laporan Pertanggungjawaban Tahunan Buku 2025 (Audited)",
      auditorName: "Kantor Akuntan Publik Independen",
      opinionStatus: "Wajar Tanpa Pengecualian (WTP)",
      totalFundsIn: 685000000,
      totalFundsOut: 620000000,
      beneficiaryCount: 132,
      operationalRatio: "8.4%",
      pdfUrl: "/api/documents/download?type=audit&year=2025",
      summary: "Hasil audit independen tahun buku 2025 mencatatkan opini WTP dengan rasio biaya operasional 8.4%, jauh di bawah batas maksimal regulasi BAZNAS (12.5%). Seluruh dana tersalurkan akuntabel kepada 132 penerima manfaat binaan Cakung.",
    },
    {
      id: "rep-2024",
      year: 2024,
      title: "Laporan Pertanggungjawaban Tahunan Buku 2024 (Audited)",
      auditorName: "Kantor Akuntan Publik Independen",
      opinionStatus: "Wajar Tanpa Pengecualian (WTP)",
      totalFundsIn: 520000000,
      totalFundsOut: 475000000,
      beneficiaryCount: 120,
      operationalRatio: "8.9%",
      pdfUrl: "/api/documents/download?type=audit&year=2024",
      summary: "Audit keuangan syariah tahun buku 2024 membuktikan kepatuhan penuh atas tata kelola amanah ZISWAF dan standar akuntansi nirlaba ISAK 35.",
    },
  ];

  for (const rep of auditSeeds) {
    await prisma.auditReport.create({ data: rep });
  }

  // 11. Seed Articles
  console.log("📰 11. Menanam Artikel & Edukasi Literasi (Article)...");
  await prisma.article.deleteMany({});
  for (const art of ARTICLES) {
    const validCategories = validateArticleCategories(art.categories || [art.category]);
    await prisma.article.create({
      data: {
        id: art.id,
        title: art.title,
        slug: art.slug,
        category: validCategories[0],
        categories: validCategories,
        tags: art.tags || [],
        excerpt: art.excerpt,
        content: art.content,
        author: art.author,
        bannerUrl: art.bannerUrl || null,
        imageSource: art.imageSource || null,
        imageSourceUrl: art.imageSourceUrl || null,
        likeCount: art.likeCount || 0,
        dislikeCount: art.dislikeCount || 0,
        publishedAt: new Date(art.publishedAt),
      },
    });
  }

  console.log("✨ ALHAMDULILLAH! Master Database Seeding selesai dengan sempurna.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
