"use client";

const INVOICES_STORAGE_KEY = "pabe_donor_invoices";
const USER_PRAYERS_KEY = "pabe_user_prayers";
export const PRAYER_SUBMITTED_EVENT = "pabe_prayer_submitted";

/**
 * Simpan data tagihan donatur lokal untuk melacak status penulisan doa.
 */
export function saveDonorInvoice({
  invoiceId,
  token = "",
  campaignSlug = "",
  donorName = "Donatur",
  isAnonymous = false,
  hasPrayer = false,
}) {
  if (typeof window === "undefined" || !invoiceId) return;
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY) || localStorage.getItem("ygsm_donor_invoices");
    const list = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex((item) => item.invoiceId === invoiceId);

    const record = {
      invoiceId,
      token: token || (existingIndex >= 0 ? list[existingIndex]?.token : "") || "",
      campaignSlug,
      donorName,
      isAnonymous: Boolean(isAnonymous),
      hasPrayer: Boolean(hasPrayer),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.push(record);
    }

    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(list));

    if (hasPrayer && campaignSlug) {
      markCampaignPrayerAsSubmitted(campaignSlug);
    }
  } catch {
    // Abaikan kegagalan localStorage
  }
}

/**
 * Periksa apakah ada tagihan donasi yang belum memiliki doa untuk campaign tertentu.
 */
export function getPendingDonationForCampaign(campaignSlug, customInvoicesRaw = null) {
  if (typeof window === "undefined" || !campaignSlug) return null;
  try {
    if (hasCampaignPrayerBeenSubmitted(campaignSlug)) {
      return null;
    }

    const raw =
      customInvoicesRaw !== null
        ? customInvoicesRaw
        : localStorage.getItem(INVOICES_STORAGE_KEY) || localStorage.getItem("ygsm_donor_invoices");
    if (!raw) return null;

    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;

    const pending = list
      .filter((item) => item.campaignSlug === campaignSlug && !item.hasPrayer)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return pending.length > 0 ? pending[0] : null;
  } catch {
    return null;
  }
}


/**
 * Tandai doa sudah dibuat untuk campaign dan invoice bersangkutan.
 */
export function markPrayerSubmitted(campaignSlug, invoiceId) {
  if (typeof window === "undefined") return;
  try {
    if (campaignSlug) {
      markCampaignPrayerAsSubmitted(campaignSlug);
    }

    if (invoiceId) {
      const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        const item = list.find((i) => i.invoiceId === invoiceId);
        if (item) {
          item.hasPrayer = true;
          item.updatedAt = Date.now();
          localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(list));
        }
      }
    }

    window.dispatchEvent(
      new CustomEvent(PRAYER_SUBMITTED_EVENT, {
        detail: { campaignSlug, invoiceId },
      })
    );
  } catch {
    // Abaikan kegagalan localStorage
  }
}

function markCampaignPrayerAsSubmitted(campaignSlug) {
  try {
    const raw = localStorage.getItem(USER_PRAYERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list) && !list.includes(campaignSlug)) {
      list.push(campaignSlug);
      localStorage.setItem(USER_PRAYERS_KEY, JSON.stringify(list));
    }
  } catch {
    // Abaikan
  }
}

export function hasCampaignPrayerBeenSubmitted(campaignSlug) {
  if (typeof window === "undefined" || !campaignSlug) return false;
  try {
    const raw = localStorage.getItem(USER_PRAYERS_KEY) || localStorage.getItem("ygsm_user_prayers");
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(campaignSlug);
  } catch {
    return false;
  }
}
