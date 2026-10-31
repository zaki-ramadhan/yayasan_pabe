export const AUDIT_REPORTS = [
  {
    id: "rep-2025",
    year: 2025,
    title: "Laporan Keuangan & Penyaluran Tahunan 2025",
    auditorName: "Internal Pembukuan Yayasan",
    opinionStatus: "Terbuka & Akuntabel",
    totalFundsIn: 732700000,
    totalFundsOut: 665200000,
    beneficiaryCount: 132,
    operationalRatio: "9.2%",
    pdfUrl: "/api/documents/download?type=audit&year=2025",
    summary: "Laporan pertanggungjawaban pengelolaan dana donasi dan penyaluran PABE per 31 Desember 2025. Rasio operasional terjaga sangat sehat di bawah batas maksimal regulasi BAZNAS dan Kemenag RI.",
  },
  {
    id: "rep-2024",
    year: 2024,
    title: "Laporan Keuangan & Penyaluran Tahunan 2024",
    auditorName: "Internal Pembukuan Yayasan",
    opinionStatus: "Terbuka & Akuntabel",
    totalFundsIn: 540000000,
    totalFundsOut: 495000000,
    beneficiaryCount: 95,
    operationalRatio: "9.1%",
    pdfUrl: "/api/documents/download?type=audit&year=2024",
    summary: "Laporan pertanggungjawaban tahun buku 2024 membuktikan kepatuhan penuh tata kelola keuangan syariah dan akuntabilitas amanah ZISWAF.",
  },
];

export const TRANSPARENCY_METRICS = {
  totalDonationsAllTime: 732700000,
  totalBeneficiaries: 132,
  activeCampaignsCount: 8,
  partnerPesantrenCount: 4,
  reportStatus: "Terbuka & Akuntabel",
};

export const PROGRAM_ALLOCATIONS = [
  {
    id: "santunan-yatim",
    label: "Santunan Yatim & Kaum Dhu'afa",
    percentage: 64,
    amount: 469800000,
    color: "#059669", // emerald-600
  },
  {
    id: "sarana-bimbel",
    label: "Bimbel PABE Smart & Sarana Belajar",
    percentage: 22,
    amount: 162400000,
    color: "#0284c7", // sky-600
  },
  {
    id: "kesehatan",
    label: "Layanan Kesehatan & Terapi Akupresur",
    percentage: 14,
    amount: 100500000,
    color: "#d97706", // amber-600
  },
];

export const ANNUAL_DISTRIBUTION_TREND = [
  { year: "2021", amount: 860000000, beneficiaries: 3200 },
  { year: "2022", amount: 1510000000, beneficiaries: 5450 },
  { year: "2023", amount: 2480000000, beneficiaries: 8400 },
  { year: "2024", amount: 3290000000, beneficiaries: 11100 },
  { year: "2025", amount: 4420000000, beneficiaries: 14250 },
];

export const MONTHLY_DISTRIBUTION_12M = [
  { month: "Jan", fullMonth: "Januari", amount: 320000000, beneficiaries: 1120 },
  { month: "Feb", fullMonth: "Februari", amount: 345000000, beneficiaries: 1180 },
  { month: "Mar", fullMonth: "Maret", amount: 410000000, beneficiaries: 1350 },
  { month: "Apr", fullMonth: "April", amount: 460000000, beneficiaries: 1480 },
  { month: "Mei", fullMonth: "Mei", amount: 310000000, beneficiaries: 1050 },
  { month: "Jun", fullMonth: "Juni", amount: 385000000, beneficiaries: 1290 },
  { month: "Jul", fullMonth: "Juli", amount: 330000000, beneficiaries: 1100 },
  { month: "Agu", fullMonth: "Agustus", amount: 340000000, beneficiaries: 1150 },
  { month: "Sep", fullMonth: "September", amount: 360000000, beneficiaries: 1210 },
  { month: "Okt", fullMonth: "Oktober", amount: 375000000, beneficiaries: 1240 },
  { month: "Nov", fullMonth: "November", amount: 390000000, beneficiaries: 1280 },
  { month: "Des", fullMonth: "Desember", amount: 425000000, beneficiaries: 1400 },
];
