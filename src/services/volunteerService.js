import prisma from "@/lib/prisma";
import {
  sanitizeInput,
  validateName,
  validatePhone,
  validateEmail,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";

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
    interest: sanitizeInput(interest) || "Pengajar & Pembimbing Al-Qur'an",
    motivation: sanitizeInput(motivation).slice(0, 500) || "",
    status: "PENDING",
  };

  try {
    const created = await prisma.volunteer.create({
      data: cleanData,
    });
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

