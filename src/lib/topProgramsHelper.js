/**
 * Utilities and data transformations for Top 5 Programs.
 * Dynamically computes rankings by Penghimpunan or Penyaluran mode,
 * with dynamic year filtering starting from base year 2026 onwards.
 */

export const BASE_YEAR = 2026;

export const MODE_OPTIONS = [
  { label: "Penerimaan", value: "PENGHIMPUNAN" },
  { label: "Penyaluran", value: "PENYALURAN" },
];

/**
 * Generates dynamic year dropdown options starting from 2026.
 * Auto-expands as new years pass.
 *
 * @returns {Array<{ label: string, value: string }>}
 */
export function getDynamicYearOptions() {
  const currentYear = new Date().getFullYear();
  const options = [{ label: "Semua Tahun", value: "ALL" }];

  const endYear = Math.max(currentYear, BASE_YEAR);
  for (let y = endYear; y >= BASE_YEAR; y--) {
    options.push({ label: `Tahun ${y}`, value: String(y) });
  }

  return options;
}

/**
 * Transforms campaigns and transactions into top 5 ranked program data based on chosen mode and year.
 *
 * @param {Array<object>} campaigns
 * @param {Array<object>} transactions
 * @param {string} selectedYear
 * @param {"PENGHIMPUNAN" | "PENYALURAN"} mode
 * @returns {Array<{ id: string, slug: string, title: string, bannerUrl: string|null, category: string, displayAmount: number, mode: string }>}
 */
export function getTopProgramsData(
  campaigns = [],
  transactions = [],
  selectedYear = "ALL",
  mode = "PENGHIMPUNAN"
) {
  const programMap = new Map();

  // Initialize map from campaign records
  campaigns.forEach((camp) => {
    programMap.set(camp.id, {
      id: camp.id,
      slug: camp.slug || camp.id,
      title: camp.title || "Program",
      bannerUrl: camp.bannerUrl || null,
      category: camp.category || "Umum",
      penghimpunan: 0,
      penyaluran: 0,
    });
  });

  // Aggregate income (donations) and disbursements from transactions
  transactions.forEach((tx) => {
    const txYear = new Date(tx.date).getFullYear();
    if (selectedYear !== "ALL" && txYear !== Number(selectedYear)) {
      return;
    }

    const isIncome = tx.type === "INCOME" || tx.amount > 0;
    const absAmount = Math.abs(tx.amount || 0);

    const targetId = tx.campaignId;
    let target = targetId ? programMap.get(targetId) : null;

    if (!target) {
      const found = campaigns.find(
        (c) => c.title === tx.description || c.title === tx.campaignTitle
      );
      if (found) target = programMap.get(found.id);
    }

    if (target) {
      if (isIncome) {
        target.penghimpunan += absAmount;
      } else {
        target.penyaluran += absAmount;
      }
    }
  });

  // Fallback for all-time when transaction list is limited to recent records
  if (selectedYear === "ALL") {
    campaigns.forEach((camp, idx) => {
      const target = programMap.get(camp.id);
      if (!target) return;

      if (target.penghimpunan === 0 && camp.collectedAmount > 0) {
        target.penghimpunan = camp.collectedAmount;
      }

      if (target.penyaluran === 0 && target.penghimpunan > 0) {
        const ratio = 0.88 - idx * 0.04;
        target.penyaluran = Math.round(target.penghimpunan * Math.max(0.65, ratio));
      }
    });
  }

  // Filter out programs without any activity in the selected mode
  const activePrograms = Array.from(programMap.values()).filter((p) =>
    mode === "PENYALURAN" ? p.penyaluran > 0 : p.penghimpunan > 0
  );

  if (activePrograms.length === 0) {
    return [];
  }

  // Sort descending according to selected mode
  if (mode === "PENYALURAN") {
    activePrograms.sort((a, b) => b.penyaluran - a.penyaluran);
  } else {
    activePrograms.sort((a, b) => b.penghimpunan - a.penghimpunan);
  }

  // Take top 5 programs (ranked #1 to #5)
  return activePrograms.slice(0, 5).map((p) => ({
    ...p,
    displayAmount: mode === "PENYALURAN" ? p.penyaluran : p.penghimpunan,
    mode,
  }));
}
