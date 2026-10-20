export const AUDIT_REPORTS = [
  {
    id: "rep-2025",
    year: 2025,
    title: "Laporan Keuangan & Penyaluran Tahunan 2025 (Audited)",
    auditorName: "Kantor Akuntan Publik (KAP) Rama & Rekan",
    opinionStatus: "Wajar Tanpa Pengecualian (WTP)",
    totalFundsIn: 4850000000,
    totalFundsOut: 4420000000,
    beneficiaryCount: 14250,
    operationalRatio: "8.8%",
    pdfUrl: "/api/documents/download?type=audit&year=2025",
    summary: "Laporan hasil audit independen atas laporan keuangan PABE per 31 Desember 2025 dengan opini WTP. Rasio operasional terjaga sangat sehat di bawah batas maksimal regulasi BAZNAS dan Kemenag RI.",
  },
  {
    id: "rep-2024",
    year: 2024,
    title: "Laporan Keuangan & Penyaluran Tahunan 2024 (Audited)",
    auditorName: "Kantor Akuntan Publik (KAP) Rama & Rekan",
    opinionStatus: "Wajar Tanpa Pengecualian (WTP)",
    totalFundsIn: 3620000000,
    totalFundsOut: 3290000000,
    beneficiaryCount: 11100,
    operationalRatio: "9.1%",
    pdfUrl: "/api/documents/download?type=audit&year=2024",
    summary: "Hasil audit independen per 31 Desember 2024 membuktikan kepatuhan penuh tata kelola keuangan syariah dan standar akuntansi keuangan entitas nirlaba (ISAK 35).",
  },
  {
    id: "rep-2023",
    year: 2023,
    title: "Laporan Keuangan & Penyaluran Tahunan 2023 (Audited)",
    auditorName: "Kantor Akuntan Publik (KAP) Rama & Rekan",
    opinionStatus: "Wajar Tanpa Pengecualian (WTP)",
    totalFundsIn: 2750000000,
    totalFundsOut: 2480000000,
    beneficiaryCount: 8400,
    operationalRatio: "9.4%",
    pdfUrl: "/api/documents/download?type=audit&year=2023",
    summary: "Laporan audit tahunan 2023 dengan opini Wajar Tanpa Pengecualian, membuktikan integritas penyaluran dana zakat, infaq, sedekah, dan wakaf yang akuntabel.",
  },
];

export const TRANSPARENCY_METRICS = {
  totalDonationsAllTime: 12500000000,
  totalBeneficiaries: 32400,
  activeCampaignsCount: 10,
  partnerPesantrenCount: 45,
  kapAuditOpinion: "Wajar Tanpa Pengecualian (WTP)",
};

export const PROGRAM_ALLOCATIONS = [
  {
    id: "tahfidz",
    label: "Pendidikan & Tahfidz Santri",
    percentage: 52,
    amount: 6500000000,
    color: "#059669", // emerald-600
  },
  {
    id: "yatim",
    label: "Kemandirian & Asrama Yatim",
    percentage: 28,
    amount: 3500000000,
    color: "#0284c7", // sky-600
  },
  {
    id: "dhuafa",
    label: "Bantuan Pangan & Kesehatan",
    percentage: 12,
    amount: 1500000000,
    color: "#d97706", // amber-600
  },
  {
    id: "operasional",
    label: "Operasional & Hak Amil",
    percentage: 8,
    amount: 1000000000,
    color: "#64748b", // slate-500
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
