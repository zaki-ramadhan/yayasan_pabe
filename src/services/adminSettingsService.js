import prisma from "@/lib/prisma";
import { ORG_PROFILE } from "@/data/orgProfile";
import { sanitizeInput } from "@/lib/security";
import { validateOrgSettings } from "@/lib/validator";

/**
 * Mengambil data pengaturan profil dan rekening resmi yayasan langsung dari PostgreSQL.
 */
export async function getOrgSettings() {
  try {
    const dbSetting = await prisma.orgSetting.findUnique({
      where: { id: "org_profile" },
    });

    if (dbSetting) {
      return {
        name: dbSetting.name,
        shortName: dbSetting.shortName,
        tagline: dbSetting.tagline || ORG_PROFILE.tagline,
        legal: {
          skKemenkumham: dbSetting.legalSk || ORG_PROFILE.legal.skKemenkumham,
          npwp: dbSetting.npwp || ORG_PROFILE.legal.npwp,
          izinIzinSosial: dbSetting.izinSosial || ORG_PROFILE.legal.izinIzinSosial,
        },
        contacts: {
          address: dbSetting.address || ORG_PROFILE.contacts.address,
          phone: dbSetting.phone || ORG_PROFILE.contacts.phone,
          whatsapp: dbSetting.whatsapp || ORG_PROFILE.contacts.whatsapp,
          email: dbSetting.email || ORG_PROFILE.contacts.email,
          officeHours: dbSetting.officeHours || ORG_PROFILE.contacts.officeHours,
        },
        officialBankAccounts: dbSetting.bankAccounts || ORG_PROFILE.officialBankAccounts,
        vision: dbSetting.vision || ORG_PROFILE.vision,
        missions: dbSetting.missions?.length > 0 ? dbSetting.missions : ORG_PROFILE.missions,
      };
    }
  } catch (error) {
    console.warn("Prisma getOrgSettings fallback:", error.message);
  }

  return {
    name: ORG_PROFILE.name,
    shortName: ORG_PROFILE.shortName,
    tagline: ORG_PROFILE.tagline,
    legal: { ...ORG_PROFILE.legal },
    contacts: { ...ORG_PROFILE.contacts },
    officialBankAccounts: [...ORG_PROFILE.officialBankAccounts],
    vision: ORG_PROFILE.vision,
    missions: [...ORG_PROFILE.missions],
  };
}

/**
 * Memperbarui pengaturan profil dan rekening resmi yayasan secara persisten ke PostgreSQL.
 */
export async function updateOrgSettings(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Data pengaturan tidak valid.");
  }

  const validation = validateOrgSettings(payload);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const current = await getOrgSettings();

  const updatedName = sanitizeInput(payload.name || current.name);
  const updatedShortName = sanitizeInput(payload.shortName || current.shortName);
  const updatedTagline = sanitizeInput(payload.tagline || current.tagline);
  const updatedLegalSk = sanitizeInput(payload.legal?.skKemenkumham || current.legal.skKemenkumham);
  const updatedNpwp = sanitizeInput(payload.legal?.npwp || current.legal.npwp);
  const updatedIzinSosial = sanitizeInput(payload.legal?.izinIzinSosial || current.legal.izinIzinSosial);
  const updatedAddress = sanitizeInput(payload.contacts?.address || current.contacts.address);
  const updatedPhone = sanitizeInput(payload.contacts?.phone || current.contacts.phone);
  const updatedWhatsapp = sanitizeInput(payload.contacts?.whatsapp || current.contacts.whatsapp);
  const updatedEmail = sanitizeInput(payload.contacts?.email || current.contacts.email).toLowerCase();
  const updatedOfficeHours = sanitizeInput(payload.contacts?.officeHours || current.contacts.officeHours);

  const updatedBankAccounts = Array.isArray(payload.officialBankAccounts)
    ? payload.officialBankAccounts.map((b) => ({
        bank: sanitizeInput(b.bank || ""),
        accountNumber: sanitizeInput(b.accountNumber || "").replace(/\D/g, ""),
        accountName: sanitizeInput(b.accountName || ""),
        category: sanitizeInput(b.category || "Infaq & Sedekah"),
      }))
    : current.officialBankAccounts;

  const updatedVision = sanitizeInput(payload.vision || current.vision);
  const updatedMissions = Array.isArray(payload.missions)
    ? payload.missions.map((m) => sanitizeInput(m))
    : current.missions;

  await prisma.orgSetting.upsert({
    where: { id: "org_profile" },
    update: {
      name: updatedName,
      shortName: updatedShortName,
      tagline: updatedTagline,
      legalSk: updatedLegalSk,
      npwp: updatedNpwp,
      izinSosial: updatedIzinSosial,
      address: updatedAddress,
      phone: updatedPhone,
      whatsapp: updatedWhatsapp,
      email: updatedEmail,
      officeHours: updatedOfficeHours,
      bankAccounts: updatedBankAccounts,
      vision: updatedVision,
      missions: updatedMissions,
    },
    create: {
      id: "org_profile",
      name: updatedName,
      shortName: updatedShortName,
      tagline: updatedTagline,
      legalSk: updatedLegalSk,
      npwp: updatedNpwp,
      izinSosial: updatedIzinSosial,
      address: updatedAddress,
      phone: updatedPhone,
      whatsapp: updatedWhatsapp,
      email: updatedEmail,
      officeHours: updatedOfficeHours,
      bankAccounts: updatedBankAccounts,
      vision: updatedVision,
      missions: updatedMissions,
    },
  });

  return getOrgSettings();
}
