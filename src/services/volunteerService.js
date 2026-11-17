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
    interest: sanitizeInput(interest) || "Anggota Relawan",
    motivation: sanitizeInput(motivation).slice(0, FIELD_LIMITS.MOTIVATION.max) || "",
    status: "PENDING",
  };

  const duplicateConditions = [];
  if (cleanEmail) {
    duplicateConditions.push({ email: { equals: cleanEmail, mode: "insensitive" } });
  }
  if (cleanData.phone) {
    duplicateConditions.push({ phone: cleanData.phone });
  }

  if (duplicateConditions.length > 0) {
    const existing = await prisma.volunteer.findFirst({
      where: {
        OR: duplicateConditions,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    if (existing) {
      if (existing.status === "APPROVED") {
        throw new Error(
          "Email atau nomor WhatsApp ini sudah terdaftar sebagai relawan aktif Yayasan Payung Berkah."
        );
      }
      if (existing.status === "PENDING" || existing.status === "CONTACTED") {
        throw new Error(
          "Pendaftaran relawan dengan email atau nomor WhatsApp ini sudah diajukan dan sedang dalam proses pemeriksaan."
        );
      }
      if (existing.status === "REJECTED") {
        const updated = await prisma.volunteer.update({
          where: { id: existing.id },
          data: {
            ...cleanData,
            status: "PENDING",
            createdAt: new Date(),
          },
        });

        if (cleanEmail) {
          try {
            await sendVolunteerRegistrationEmail({
              to: cleanEmail,
              name: updated.fullName,
              city: updated.city,
              interest: updated.interest,
            });
          } catch (emailErr) {
            console.warn("Gagal mengirim email konfirmasi pendaftaran relawan:", emailErr?.message);
          }
        }

        try {
          broadcastAdminEvent("VOLUNTEER_CHECKIN", {
            id: updated.id,
            name: updated.fullName,
            fullName: updated.fullName,
            email: updated.email || "",
            phone: updated.phone || "",
            city: updated.city,
            interest: updated.interest || "Anggota Relawan",
            motivation: updated.motivation || "",
            status: "PENDING",
            activity: `Pendaftaran Relawan Baru (${updated.city})`,
            timestamp: new Date().toISOString(),
          });
        } catch (sseErr) {
          console.warn("Peringatan: Gagal broadcast SSE volunteer:", sseErr?.message);
        }

        return {
          success: true,
          data: {
            id: updated.id,
            fullName: updated.fullName,
            city: updated.city,
            status: updated.status,
          },
          message: "Pendaftaran relawan berhasil dikirim kembali untuk diperiksa.",
        };
      }
    }
  }

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
        interest: created.interest || "Anggota Relawan",
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
    throw new Error(error.message || "Pendaftaran relawan belum berhasil dikirim. Silakan coba beberapa saat lagi.");
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
