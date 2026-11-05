import prisma from "@/lib/prisma";
import {
  sanitizeInput,
  validateName,
  validatePhone,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";
import { sendVolunteerRegistrationEmail } from "@/services/emailService";

/**
 * Service server-side untuk operasi database relawan (Prisma SSOT).
 */

export async function registerVolunteer({
  fullName,
  email = "",
  phone,
  city,
  interest,
  motivation = "",
}) {
  const nameVal = validateName(fullName);
  if (!nameVal.isValid) throw new Error(nameVal.message);

  const phoneVal = validatePhone(phone);
  if (!phoneVal.isValid) throw new Error(phoneVal.message);

  let cleanEmail = null;
  if (email) {
    const emailVal = await verifyEmailDomainDns(email, { isRequired: true });
    if (!emailVal.isValid) throw new Error(emailVal.message);
    cleanEmail = emailVal.sanitized;
  }

  const cleanCity = sanitizeInput(city);
  if (!cleanCity || cleanCity.length < 2) {
    throw new Error("Mohon masukkan kota domisili yang valid.");
  }

  const cleanData = {
    fullName: nameVal.sanitized,
    email: cleanEmail,
    phone: phoneVal.sanitized,
    city: cleanCity,
    interest: sanitizeInput(interest) || "Relawan Kebaikan",
    motivation: sanitizeInput(motivation).slice(0, FIELD_LIMITS.MOTIVATION.max) || "",
    status: "PENDING",
  };

  try {
    const created = await prisma.volunteer.create({
      data: cleanData,
    });
    if (cleanEmail) {
      try {
        const existingVolunteerUser = await prisma.user.findFirst({
          where: { email: cleanEmail },
          select: { id: true, phone: true, city: true },
        });
        if (existingVolunteerUser) {
          const updateData = {};
          if ((!existingVolunteerUser.phone || existingVolunteerUser.phone === "-") && cleanData.phone) {
            updateData.phone = cleanData.phone;
          }
          if (!existingVolunteerUser.city && cleanData.city) {
            updateData.city = cleanData.city;
          }
          if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
              where: { id: existingVolunteerUser.id },
              data: updateData,
            });
          }
        }
      } catch (uErr) {
        console.warn("Gagal sinkronisasi otomatis nomor WhatsApp/domisili relawan ke profil:", uErr?.message);
      }
    }

    if (cleanEmail) {
      try {
        await sendVolunteerRegistrationEmail({
          to: cleanEmail,
          name: created.fullName,
          city: created.city,
          interest: created.interest,
        });
      } catch (emailErr) {
        console.warn("Gagal mengirim email konfirmasi pendaftaran relawan:", emailErr?.message);
      }
    }

    try {
      broadcastAdminEvent("VOLUNTEER_CHECKIN", {
        id: created.id,
        name: created.fullName,
        fullName: created.fullName,
        email: created.email || "",
        phone: created.phone || "",
        city: created.city,
        interest: created.interest || "Relawan Kebaikan",
        motivation: created.motivation || "",
        status: created.status || "PENDING",
        activity: `Pendaftaran Relawan Baru (${created.city})`,
        timestamp: new Date().toISOString(),
      });
    } catch (sseErr) {
      console.warn("Peringatan: Gagal broadcast SSE volunteer:", sseErr?.message);
    }

    return {
      success: true,
      data: {
        id: created.id,
        fullName: created.fullName,
        city: created.city,
        status: created.status,
      },
      message: "Pendaftaran relawan berhasil dikirim!",
    };
  } catch (error) {
    console.error("Prisma registerVolunteer error:", error.message);
    throw new Error("Gagal mendaftarkan relawan ke sistem. Silakan coba kembali.");
  }
}

export async function getVolunteers() {
  try {
    return await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma getVolunteers error:", error.message);
    return [];
  }
}

export async function getVolunteerCount() {
  try {
    return await prisma.volunteer.count();
  } catch (error) {
    console.warn("Prisma getVolunteerCount error:", error.message);
    return 0;
  }
}
