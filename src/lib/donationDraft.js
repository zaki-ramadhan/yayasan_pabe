const DRAFT_KEY = "pabe_donation_draft";

/**
 * Simpan draft form donasi ke sessionStorage sebelum redirect login.
 * @param {string} campaignSlug - Slug campaign sebagai namespace draft
 * @param {object} data - Field form yang ingin dipertahankan
 */
export function saveDonationDraft(campaignSlug, data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ campaignSlug, ...data, savedAt: Date.now() })
    );
  } catch {
    // Ignore QuotaExceededError
  }
}

/**
 * Ambil draft donasi jika masih relevan (campaign sama & tidak expired >30 mnt).
 * @param {string} campaignSlug
 * @returns {object|null}
 */
export function loadDonationDraft(campaignSlug) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);

    const isExpired = Date.now() - (draft.savedAt || 0) > 30 * 60 * 1000;
    if (draft.campaignSlug !== campaignSlug || isExpired) {
      sessionStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

/**
 * Hapus draft setelah berhasil dipakai.
 */
export function clearDonationDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}
