/**
 * Data blueprint for Distribusi (Accountability, Monthly Trends, and Sharia Governance)
 */

export const AUDIT_SUMMARY_DATA = {
  title: "Laporan Pertanggungjawaban Keuangan",
  description:
    "Kami sampaikan Laporan Tahunan sebagai bentuk komitmen kami menjadi lembaga yang profesional, amanah, dan akuntabel. Terima kasih kepada seluruh donatur atas dukungan dan kepercayaannya dalam menyalurkan zakat, infak, wakaf, serta donasi lainnya. Bersama, kita wujudkan kebermanfaatan di bidang pendidikan, dakwah, dan pemberdayaan yang berkelanjutan.",
  auditorName: "Internal Pembukuan Yayasan",
  opinion: "Terbuka & Akuntabel",
  auditPeriod: "Tahun Buku 2025",
  operationalRatio: "9.2%",
  maxAllowedRatio: "12.5%",
  totalFundsManaged: 732700000,
  pdfUrl: "/api/documents/download?type=audit&year=2025",
  downloadFilename: "Laporan-Pertanggungjawaban-PABE-2025.pdf",
  allocations: [
    {
      id: "santunan-yatim",
      name: "Santunan Yatim & Dhu'afa",
      percentage: 64,
      amount: 469800000,
      color: "#059669",
    },
    {
      id: "sarana-bimbel",
      name: "Bimbel PABE Smart & Sarana",
      percentage: 22,
      amount: 162400000,
      color: "#0284c7",
    },
    {
      id: "kesehatan",
      name: "Layanan Medis & Akupresur",
      percentage: 14,
      amount: 100500000,
      color: "#d97706",
    },
  ],
};

export const DISTRIBUTION_YEAR_OPTIONS = [
  "Tahun 2026",
  "Tahun 2025",
  "Tahun 2024",
];

export const DISTRIBUTION_TREND_DATA = {
  "Tahun 2026": [
    { month: "Jan", fullMonth: "Januari 2026", amount: 340000000, beneficiaries: 1150 },
    { month: "Feb", fullMonth: "Februari 2026", amount: 365000000, beneficiaries: 1220 },
    { month: "Mar", fullMonth: "Maret 2026", amount: 480000000, beneficiaries: 1580 },
    { month: "Apr", fullMonth: "April 2026", amount: 530000000, beneficiaries: 1720 },
    { month: "Mei", fullMonth: "Mei 2026", amount: 390000000, beneficiaries: 1310 },
    { month: "Jun", fullMonth: "Juni 2026", amount: 460000000, beneficiaries: 1490 },
    { month: "Jul", fullMonth: "Juli 2026", amount: 410000000, beneficiaries: 1380 },
    { month: "Agu", fullMonth: "Agustus 2026", amount: 435000000, beneficiaries: 1440 },
    { month: "Sep", fullMonth: "September 2026", amount: 470000000, beneficiaries: 1520 },
  ],
  "Tahun 2025": [
    { month: "Jan", fullMonth: "Januari 2025", amount: 310000000, beneficiaries: 1080 },
    { month: "Feb", fullMonth: "Februari 2025", amount: 325000000, beneficiaries: 1120 },
    { month: "Mar", fullMonth: "Maret 2025", amount: 430000000, beneficiaries: 1410 },
    { month: "Apr", fullMonth: "April 2025", amount: 490000000, beneficiaries: 1600 },
    { month: "Mei", fullMonth: "Mei 2025", amount: 330000000, beneficiaries: 1110 },
    { month: "Jun", fullMonth: "Juni 2025", amount: 390000000, beneficiaries: 1290 },
    { month: "Jul", fullMonth: "Juli 2025", amount: 340000000, beneficiaries: 1150 },
    { month: "Agu", fullMonth: "Agustus 2025", amount: 355000000, beneficiaries: 1180 },
    { month: "Sep", fullMonth: "September 2025", amount: 380000000, beneficiaries: 1260 },
    { month: "Okt", fullMonth: "Oktober 2025", amount: 395000000, beneficiaries: 1300 },
    { month: "Nov", fullMonth: "November 2025", amount: 410000000, beneficiaries: 1340 },
    { month: "Des", fullMonth: "Desember 2025", amount: 450000000, beneficiaries: 1470 },
  ],
  "Tahun 2024": [
    { month: "Jan", fullMonth: "Januari 2024", amount: 240000000, beneficiaries: 850 },
    { month: "Feb", fullMonth: "Februari 2024", amount: 255000000, beneficiaries: 890 },
    { month: "Mar", fullMonth: "Maret 2024", amount: 340000000, beneficiaries: 1150 },
    { month: "Apr", fullMonth: "April 2024", amount: 390000000, beneficiaries: 1310 },
    { month: "Mei", fullMonth: "Mei 2024", amount: 260000000, beneficiaries: 880 },
    { month: "Jun", fullMonth: "Juni 2024", amount: 290000000, beneficiaries: 990 },
    { month: "Jul", fullMonth: "Juli 2024", amount: 270000000, beneficiaries: 910 },
    { month: "Agu", fullMonth: "Agustus 2024", amount: 280000000, beneficiaries: 940 },
    { month: "Sep", fullMonth: "September 2024", amount: 300000000, beneficiaries: 1010 },
    { month: "Okt", fullMonth: "Oktober 2024", amount: 310000000, beneficiaries: 1040 },
    { month: "Nov", fullMonth: "November 2024", amount: 320000000, beneficiaries: 1070 },
    { month: "Des", fullMonth: "Desember 2024", amount: 350000000, beneficiaries: 1170 },
  ],
};
