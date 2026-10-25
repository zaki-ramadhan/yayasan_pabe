/**
 * Safe fallback structures when database query fails
 */
export function getFallbackAnalytics() {
  return {
    financialDetails: {
      availableYears: [{ id: "all", label: "Semua Tahun" }],
      categories: [],
      monthlyData: [],
      categoryDistribution: [],
    },
    cashFlowDetails: {
      availableYears: [{ id: "all", label: "Semua Tahun" }],
      monthlyData: [],
      totals: {
        cashIn: 0,
        cashOut: 0,
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
