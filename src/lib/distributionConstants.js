/**
 * Menghitung anggaran penyaluran yang aman untuk suatu program donasi.
 *
 * @param {object} params
 * @param {number} params.collectedAmount - Total dana yang berhasil dihimpun dari donatur
 * @param {number} params.totalDisbursed - Total dana yang telah disalurkan sebelumnya
 * @param {number} [params.currentDisbursementAmount=0] - Nominal penyaluran yang sedang diedit (jika mode edit)
 * @returns {{
 *   collectedAmount: number,
 *   totalDisbursed: number,
 *   remainingBudget: number,
 *   isOverBudget: boolean,
 *   disbursementRatioPercent: number
 * }}
 */
export function calculateCampaignDisbursementBudget({
  collectedAmount = 0,
  totalDisbursed = 0,
  currentDisbursementAmount = 0,
}) {
  const safeCollected = Math.max(0, Number(collectedAmount) || 0);
  const safeDisbursed = Math.max(0, Number(totalDisbursed) || 0);
  const safeCurrent = Math.max(0, Number(currentDisbursementAmount) || 0);

  // Jika sedang mengedit, kurangkan nominal lama dari totalDisbursed agar tidak terhitung ganda
  const netOtherDisbursed = Math.max(0, safeDisbursed - safeCurrent);
  const remainingBudget = Math.max(0, safeCollected - netOtherDisbursed);

  const disbursementRatioPercent = safeCollected > 0
    ? Math.min(100, Number(((safeDisbursed / safeCollected) * 100).toFixed(1)))
    : 0;

  const isOverBudget = netOtherDisbursed > safeCollected;

  return {
    collectedAmount: safeCollected,
    totalDisbursed: safeDisbursed,
    remainingBudget,
    isOverBudget,
    disbursementRatioPercent,
  };
}

/**
 * Validasi apakah nominal penyaluran baru berada di dalam batas saldo tersedia.
 *
 * @param {number} requestedAmount
 * @param {number} remainingBudget
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateDisbursementAmount(requestedAmount, remainingBudget) {
  const amount = Number(requestedAmount) || 0;
  const budget = Number(remainingBudget) || 0;

  if (amount <= 0) {
    return {
      isValid: false,
      error: "Nominal dana penyaluran wajib lebih dari Rp 0.",
    };
  }

  if (budget <= 0) {
    return {
      isValid: false,
      error: "Program ini belum memiliki saldo donasi terkumpul untuk disalurkan.",
    };
  }

  if (amount > budget) {
    return {
      isValid: false,
      error: `Maksimal penyaluran Rp ${budget.toLocaleString("id-ID")}.`,
    };
  }

  return { isValid: true, error: null };
}
