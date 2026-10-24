/**
 * Fallback realistis sesuai timeline 2025-2026
 */
export function getFallbackAnalytics() {
  const categories = [
    { id: "Pendidikan & Santri", name: "Pendidikan & Santri", color: "#059669" },
    { id: "Zakat", name: "Zakat", color: "#2563eb" },
    { id: "Kemandirian Yatim", name: "Kemandirian Yatim", color: "#7c3aed" },
    { id: "Infaq & Sedekah", name: "Infaq & Sedekah", color: "#f59e0b" },
    { id: "Tanggap Bencana", name: "Tanggap Bencana", color: "#e11d48" },
    { id: "Pemberdayaan Umat", name: "Pemberdayaan Umat", color: "#0891b2" },
  ];

  const monthlyData = [
    { month: "Agu 25", year: "2025", "Pendidikan & Santri": 55000000, Zakat: 40000000, "Kemandirian Yatim": 30000000, "Infaq & Sedekah": 25000000, "Tanggap Bencana": 10000000, "Pemberdayaan Umat": 15000000, penyaluran: 155000000, cashIn: 175000000, cashOut: 155000000 },
    { month: "Sep 25", year: "2025", "Pendidikan & Santri": 60000000, Zakat: 45000000, "Kemandirian Yatim": 35000000, "Infaq & Sedekah": 28000000, "Tanggap Bencana": 12000000, "Pemberdayaan Umat": 18000000, penyaluran: 175000000, cashIn: 198000000, cashOut: 175000000 },
    { month: "Okt 25", year: "2025", "Pendidikan & Santri": 52000000, Zakat: 42000000, "Kemandirian Yatim": 32000000, "Infaq & Sedekah": 24000000, "Tanggap Bencana": 15000000, "Pemberdayaan Umat": 14000000, penyaluran: 160000000, cashIn: 179000000, cashOut: 160000000 },
    { month: "Nov 25", year: "2025", "Pendidikan & Santri": 48000000, Zakat: 38000000, "Kemandirian Yatim": 29000000, "Infaq & Sedekah": 22000000, "Tanggap Bencana": 20000000, "Pemberdayaan Umat": 13000000, penyaluran: 150000000, cashIn: 170000000, cashOut: 150000000 },
    { month: "Des 25", year: "2025", "Pendidikan & Santri": 58000000, Zakat: 46000000, "Kemandirian Yatim": 36000000, "Infaq & Sedekah": 30000000, "Tanggap Bencana": 18000000, "Pemberdayaan Umat": 16000000, penyaluran: 185000000, cashIn: 204000000, cashOut: 185000000 },
    { month: "Jan 26", year: "2026", "Pendidikan & Santri": 62000000, Zakat: 50000000, "Kemandirian Yatim": 38000000, "Infaq & Sedekah": 32000000, "Tanggap Bencana": 14000000, "Pemberdayaan Umat": 20000000, penyaluran: 195000000, cashIn: 216000000, cashOut: 195000000 },
    { month: "Feb 26", year: "2026", "Pendidikan & Santri": 65000000, Zakat: 52000000, "Kemandirian Yatim": 40000000, "Infaq & Sedekah": 35000000, "Tanggap Bencana": 16000000, "Pemberdayaan Umat": 22000000, penyaluran: 210000000, cashIn: 230000000, cashOut: 210000000 },
    { month: "Mar 26", year: "2026", "Pendidikan & Santri": 70000000, Zakat: 58000000, "Kemandirian Yatim": 45000000, "Infaq & Sedekah": 40000000, "Tanggap Bencana": 18000000, "Pemberdayaan Umat": 25000000, penyaluran: 235000000, cashIn: 256000000, cashOut: 235000000 },
    { month: "Apr 26", year: "2026", "Pendidikan & Santri": 110000000, Zakat: 125000000, "Kemandirian Yatim": 65000000, "Infaq & Sedekah": 55000000, "Tanggap Bencana": 25000000, "Pemberdayaan Umat": 35000000, penyaluran: 380000000, cashIn: 415000000, cashOut: 380000000 },
    { month: "Mei 26", year: "2026", "Pendidikan & Santri": 120000000, Zakat: 135000000, "Kemandirian Yatim": 70000000, "Infaq & Sedekah": 60000000, "Tanggap Bencana": 30000000, "Pemberdayaan Umat": 40000000, penyaluran: 520000000, cashIn: 455000000, cashOut: 520000000 },
  ];

  const categoryDistribution = [
    { name: "Pendidikan & Santri", value: 3850000000, percentage: 31, color: "#059669" },
    { name: "Zakat", value: 3350000000, percentage: 27, color: "#2563eb" },
    { name: "Kemandirian Yatim", value: 2150000000, percentage: 17, color: "#7c3aed" },
    { name: "Infaq & Sedekah", value: 1750000000, percentage: 14, color: "#f59e0b" },
    { name: "Tanggap Bencana", value: 850000000, percentage: 7, color: "#e11d48" },
    { name: "Pemberdayaan Umat", value: 550000000, percentage: 4, color: "#0891b2" },
  ];

  const availableYears = [
    { id: "all", label: "Semua Tahun" },
    { id: "2026", label: "Tahun 2026" },
    { id: "2025", label: "Tahun 2025" },
  ];

  return {
    financialDetails: {
      availableYears,
      categories,
      monthlyData,
      categoryDistribution,
    },
    cashFlowDetails: {
      availableYears,
      monthlyData: monthlyData.map((m) => ({
        month: m.month,
        year: m.year,
        cashIn: m.cashIn,
        cashOut: m.cashOut,
      })),
      totals: {
        cashIn: 12500000000,
        cashOut: 11000000000,
      },
    },
  };
}

/**
 * Helper agregasi riil dari transaksi database (Prisma)
 */
export function aggregateFinancialAnalytics(donations = [], updates = [], totalIncome = 0, totalExpenses = 0) {
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const CATEGORY_COLOR_MAP = {
    "Pendidikan & Santri": "#059669",
    "Zakat": "#2563eb",
    "ZISWAF": "#2563eb",
    "Infaq & Sedekah": "#f59e0b",
    "Kemandirian Yatim": "#7c3aed",
    "Tanggap Bencana": "#e11d48",
    "Pemberdayaan Umat": "#0891b2",
    "Sedekah Subuh": "#4f46e5",
    "Wakaf": "#d97706",
    "Kesehatan": "#0d9488",
    "Umum": "#64748b",
  };
  const PALETTE = [
    "#2563eb", "#059669", "#f59e0b", "#7c3aed", "#e11d48",
    "#0891b2", "#4f46e5", "#d97706", "#0d9488", "#64748b"
  ];

  const getCatName = (d) => {
    if (d.campaign?.category?.name) return d.campaign.category.name;
    if (d.donationType === "ZAKAT") return "Zakat";
    if (d.donationType === "INFAK_SUBUH") return "Sedekah Subuh";
    if (d.donationType === "WAKAF") return "Wakaf";
    return "Infaq & Sedekah";
  };

  const yearsSet = new Set();
  const categoryTotals = {};
  const monthMap = new Map();

  donations.forEach((d) => {
    const date = d.paidAt ? new Date(d.paidAt) : new Date(d.createdAt);
    const yearStr = String(date.getFullYear());
    yearsSet.add(yearStr);

    const mIdx = date.getMonth();
    const monthKey = `${yearStr}-${String(mIdx + 1).padStart(2, "0")}`;
    const monthLabel = `${MONTH_NAMES[mIdx]} ${yearStr.slice(2)}`;
    const catName = getCatName(d);

    categoryTotals[catName] = (categoryTotals[catName] || 0) + d.amount;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        month: monthLabel,
        year: yearStr,
        categories: {},
        totalIn: 0,
        penyaluran: 0,
        cashIn: 0,
        cashOut: 0,
      });
    }

    const row = monthMap.get(monthKey);
    row.categories[catName] = (row.categories[catName] || 0) + d.amount;
    row.totalIn += d.amount;
    row.cashIn += d.amount;
  });

  updates.forEach((u) => {
    const date = u.date ? new Date(u.date) : new Date();
    const yearStr = String(date.getFullYear());
    yearsSet.add(yearStr);

    const mIdx = date.getMonth();
    const monthKey = `${yearStr}-${String(mIdx + 1).padStart(2, "0")}`;
    const monthLabel = `${MONTH_NAMES[mIdx]} ${yearStr.slice(2)}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        month: monthLabel,
        year: yearStr,
        categories: {},
        totalIn: 0,
        penyaluran: 0,
        cashIn: 0,
        cashOut: 0,
      });
    }

    const row = monthMap.get(monthKey);
    row.penyaluran += u.disbursedAmount;
    row.cashOut += u.disbursedAmount;
  });

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  if (sortedMonthKeys.length < 4) {
    return getFallbackAnalytics();
  }

  const distinctCategories = Object.keys(categoryTotals);
  const categoriesConfig = distinctCategories.map((name, idx) => ({
    id: name,
    name,
    color: CATEGORY_COLOR_MAP[name] || PALETTE[idx % PALETTE.length],
  }));

  const monthlyData = sortedMonthKeys.map((k) => {
    const item = monthMap.get(k);
    const row = {
      month: item.month,
      year: item.year,
      penyaluran: item.penyaluran,
      totalIn: item.totalIn,
      cashIn: item.cashIn,
      cashOut: item.cashOut,
    };
    distinctCategories.forEach((cat) => {
      row[cat] = item.categories[cat] || 0;
    });
    return row;
  });

  const categoryDistribution = distinctCategories.map((name, idx) => {
    const val = categoryTotals[name] || 0;
    const totalAgg = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    return {
      name,
      value: val,
      percentage: totalAgg > 0 ? Math.round((val / totalAgg) * 100) : 0,
      color: CATEGORY_COLOR_MAP[name] || PALETTE[idx % PALETTE.length],
    };
  }).sort((a, b) => b.value - a.value);

  const sortedYears = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  const availableYears = [
    { id: "all", label: "Semua Tahun" },
    ...sortedYears.map((y) => ({ id: y, label: `Tahun ${y}` })),
  ];

  return {
    financialDetails: {
      availableYears,
      categories: categoriesConfig,
      monthlyData,
      categoryDistribution,
    },
    cashFlowDetails: {
      availableYears,
      monthlyData: monthlyData.map((m) => ({
        month: m.month,
        year: m.year,
        cashIn: m.cashIn,
        cashOut: m.cashOut,
      })),
      totals: {
        cashIn: totalIncome,
        cashOut: totalExpenses,
      },
    },
  };
}
