import prisma from "@/lib/prisma";
import { ORG_PROFILE } from "@/data/orgProfile";
import { sanitizeInput } from "@/lib/security";
import { validateOrgSettings } from "@/lib/validator";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";

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
        name: dbSetting.name || ORG_PROFILE.name,
        shortName: dbSetting.shortName || ORG_PROFILE.shortName,
        tagline: dbSetting.tagline !== null ? dbSetting.tagline : ORG_PROFILE.tagline,
        legal: {
          skKemenkumham: dbSetting.legalSk !== null ? dbSetting.legalSk : ORG_PROFILE.legal.skKemenkumham,
          npwp: dbSetting.npwp !== null ? dbSetting.npwp : ORG_PROFILE.legal.npwp,
          izinIzinSosial: dbSetting.izinSosial !== null ? dbSetting.izinSosial : ORG_PROFILE.legal.izinIzinSosial,
        },
        contacts: {
          address: dbSetting.address !== null ? dbSetting.address : ORG_PROFILE.contacts.address,
          phone: dbSetting.phone !== null ? dbSetting.phone : ORG_PROFILE.contacts.phone,
          whatsapp: dbSetting.whatsapp !== null ? dbSetting.whatsapp : ORG_PROFILE.contacts.whatsapp,
          email: dbSetting.email !== null ? dbSetting.email : ORG_PROFILE.contacts.email,
          officeHours: dbSetting.officeHours !== null ? dbSetting.officeHours : ORG_PROFILE.contacts.officeHours,
        },
        officialBankAccounts: Array.isArray(dbSetting.bankAccounts)
          ? dbSetting.bankAccounts.map(({ category, ...b }) => b)
          : ORG_PROFILE.officialBankAccounts.map(({ category, ...b }) => b),
        vision: dbSetting.vision !== null ? dbSetting.vision : ORG_PROFILE.vision,
        missions: Array.isArray(dbSetting.missions) && dbSetting.missions.length > 0
          ? dbSetting.missions
          : ORG_PROFILE.missions,
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
export async function updateOrgSettings(payload, authUser = null) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Data pengaturan tidak valid.");
  }

  const validation = validateOrgSettings(payload);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (payload.contacts?.email && payload.contacts.email.trim()) {
    const emailDns = await verifyEmailDomainDns(payload.contacts.email.trim(), {
      isRequired: true,
    });
    if (!emailDns.isValid) {
      throw new Error(emailDns.message);
    }
  }

  const current = await getOrgSettings();

  const updatedName = sanitizeInput(
    payload.name !== undefined ? payload.name : current.name
  );
  const updatedShortName = sanitizeInput(
    payload.shortName !== undefined ? payload.shortName : current.shortName
  );
  const updatedTagline = sanitizeInput(
    payload.tagline !== undefined ? payload.tagline : current.tagline
  );
  const updatedLegalSk = sanitizeInput(
    payload.legal?.skKemenkumham !== undefined
      ? payload.legal.skKemenkumham
      : current.legal.skKemenkumham
  );
  const updatedNpwp = sanitizeInput(
    payload.legal?.npwp !== undefined ? payload.legal.npwp : current.legal.npwp
  );
  const updatedIzinSosial = sanitizeInput(
    payload.legal?.izinIzinSosial !== undefined
      ? payload.legal.izinIzinSosial
      : current.legal.izinIzinSosial
  );
  const updatedAddress = sanitizeInput(
    payload.contacts?.address !== undefined
      ? payload.contacts.address
      : current.contacts.address
  );
  const updatedPhone = sanitizeInput(
    payload.contacts?.phone !== undefined
      ? payload.contacts.phone
      : current.contacts.phone
  );
  const updatedWhatsapp = sanitizeInput(
    payload.contacts?.whatsapp !== undefined
      ? payload.contacts.whatsapp
      : current.contacts.whatsapp
  );
  const updatedEmail = sanitizeInput(
    payload.contacts?.email !== undefined
      ? payload.contacts.email
      : current.contacts.email
  ).toLowerCase();
  const updatedOfficeHours = sanitizeInput(
    payload.contacts?.officeHours !== undefined
      ? payload.contacts.officeHours
      : current.contacts.officeHours
  );

  const updatedBankAccounts = Array.isArray(payload.officialBankAccounts)
    ? payload.officialBankAccounts.map((b) => ({
        bank: sanitizeInput(b.bank || ""),
        accountNumber: sanitizeInput(b.accountNumber || "").replace(/\D/g, ""),
        accountName: sanitizeInput(b.accountName || ""),
      }))
    : current.officialBankAccounts.map(({ category, ...b }) => b);

  const updatedVision = sanitizeInput(
    payload.vision !== undefined ? payload.vision : current.vision
  );
  const updatedMissions = Array.isArray(payload.missions)
    ? payload.missions.map((m) => sanitizeInput(m))
    : current.missions;

  const saved = await prisma.orgSetting.upsert({
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

  if (authUser) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: authUser.id,
          userName: authUser.name,
          userRole: authUser.role,
          action: "UPDATE_ORG_SETTINGS",
          targetType: "ORG_SETTING",
          targetId: "org_profile",
          description: `Memperbarui profil, legalitas, kontak, dan rekening yayasan (${saved.name}).`,
        },
      });
    } catch (logErr) {
      console.warn("Failed to create activity log for org settings:", logErr.message);
    }
  }

  return getOrgSettings();
}
