import { ORG_PROFILE } from "@/data/orgProfile";
import { sanitizeInput } from "@/lib/security";
import { validateOrgSettings } from "@/lib/validator";

let activeOrgSettings = {
  name: ORG_PROFILE.name,
  shortName: ORG_PROFILE.shortName,
  tagline: ORG_PROFILE.tagline,
  legal: { ...ORG_PROFILE.legal },
  contacts: { ...ORG_PROFILE.contacts },
  officialBankAccounts: [...ORG_PROFILE.officialBankAccounts],
  vision: ORG_PROFILE.vision,
  missions: [...ORG_PROFILE.missions],
};

/**
 * Mengambil data pengaturan profil dan rekening resmi yayasan.
 */
export async function getOrgSettings() {
  return JSON.parse(JSON.stringify(activeOrgSettings));
}

/**
 * Memperbarui pengaturan profil dan rekening resmi yayasan.
 */
export async function updateOrgSettings(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Data pengaturan tidak valid.");
  }

  const validation = validateOrgSettings(payload);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const updated = {
    name: sanitizeInput(payload.name || activeOrgSettings.name),
    shortName: sanitizeInput(payload.shortName || activeOrgSettings.shortName),
    tagline: sanitizeInput(payload.tagline || activeOrgSettings.tagline),
    legal: {
      skKemenkumham: sanitizeInput(payload.legal?.skKemenkumham || activeOrgSettings.legal.skKemenkumham),
      npwp: sanitizeInput(payload.legal?.npwp || activeOrgSettings.legal.npwp),
      izinIzinSosial: sanitizeInput(payload.legal?.izinIzinSosial || activeOrgSettings.legal.izinIzinSosial),
    },
    contacts: {
      address: sanitizeInput(payload.contacts?.address || activeOrgSettings.contacts.address),
      phone: sanitizeInput(payload.contacts?.phone || activeOrgSettings.contacts.phone),
      whatsapp: sanitizeInput(payload.contacts?.whatsapp || activeOrgSettings.contacts.whatsapp),
      email: sanitizeInput(payload.contacts?.email || activeOrgSettings.contacts.email).toLowerCase(),
      officeHours: sanitizeInput(payload.contacts?.officeHours || activeOrgSettings.contacts.officeHours),
    },
    officialBankAccounts: Array.isArray(payload.officialBankAccounts)
      ? payload.officialBankAccounts.map((b) => ({
          bank: sanitizeInput(b.bank || ""),
          accountNumber: sanitizeInput(b.accountNumber || "").replace(/\D/g, ""),
          accountName: sanitizeInput(b.accountName || ""),
          category: sanitizeInput(b.category || "Infaq & Sedekah"),
        }))
      : activeOrgSettings.officialBankAccounts,
    vision: sanitizeInput(payload.vision || activeOrgSettings.vision),
    missions: Array.isArray(payload.missions)
      ? payload.missions.map((m) => sanitizeInput(m))
      : activeOrgSettings.missions,
  };

  activeOrgSettings = updated;
  return JSON.parse(JSON.stringify(activeOrgSettings));
}
