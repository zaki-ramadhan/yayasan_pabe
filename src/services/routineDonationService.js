import prisma from "@/lib/prisma";
import {
  sanitizeInput,
  validateName,
  validatePhone,
  validateEmail,
  DONATION_LIMITS,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";

export async function getActiveRoutineDonation(email) {
  if (!email || !String(email).trim()) return null;
  return prisma.routineDonation.findFirst({
    where: {
      donorEmail: { equals: String(email).trim(), mode: "insensitive" },
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: {
      campaign: {
        select: { title: true, slug: true, bannerUrl: true },
      },
    },
  });
}

/**
 * Service to register routine donations directly into PostgreSQL via Prisma.
 * Enforces maximum 1 active schedule per donor email.
 */
export async function createRoutineDonations({
  donorName,
  donorEmail = "",
  donorPhone = null,
  isAnonymous = false,
  programs = [],
  program = null,
}) {
  const nameVal = validateName(donorName, isAnonymous);
  if (!nameVal.isValid) throw new Error(nameVal.message);

  let cleanPhone = null;
  if (donorPhone && String(donorPhone).trim()) {
    const phoneVal = validatePhone(String(donorPhone).trim(), { isRequired: false });
    if (!phoneVal.isValid) throw new Error(phoneVal.message);
    cleanPhone = phoneVal.sanitized;
  }

  if (!donorEmail || !donorEmail.trim()) {
    throw new Error("Alamat email aktif wajib diisi untuk menerima tautan invoice dan kuitansi donasi.");
  }

  const emailVal = await verifyEmailDomainDns(donorEmail);
  if (!emailVal.isValid) throw new Error(emailVal.message);
  const cleanEmail = emailVal.sanitized;

  // Single program enforcement
  const targetPrograms = Array.isArray(programs) && programs.length > 0 ? programs : program ? [program] : [];
  if (targetPrograms.length === 0) {
    throw new Error("Minimal harus memilih 1 program donasi rutin.");
  }

  if (targetPrograms.length > 1) {
    throw new Error("Jadwal donasi rutin dibatasi untuk 1 program kebaikan.");
  }

  // Guard: Hanya boleh memiliki 1 jadwal donasi rutin aktif
  const existingActive = await prisma.routineDonation.findFirst({
    where: {
      donorEmail: { equals: cleanEmail, mode: "insensitive" },
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    select: {
      id: true,
      programTitle: true,
      status: true,
    },
  });

  if (existingActive) {
    const error = new Error("Anda sudah memiliki jadwal donasi rutin aktif. Batalkan jadwal sebelumnya untuk membuat yang baru.");
    error.statusCode = 409;
    throw error;
  }

  const p = targetPrograms[0];
  const routineType = p.routineType === "REMINDER_ONLY" ? "REMINDER_ONLY" : "AUTO_DONATION";
  const amount = Number(p.amount) || 0;

  if (routineType === "AUTO_DONATION") {
    if (amount < DONATION_LIMITS.MIN_AMOUNT) {
      throw new Error(
        `Nominal program minimal Rp ${DONATION_LIMITS.MIN_AMOUNT.toLocaleString("id-ID")}`
      );
    }
    if (amount > DONATION_LIMITS.MAX_AMOUNT) {
      throw new Error(
        `Nominal program maksimal Rp ${DONATION_LIMITS.MAX_AMOUNT.toLocaleString("id-ID")}`
      );
    }
  }

  const frequency = ["WEEKLY", "MONTHLY"].includes(p.frequency)
    ? p.frequency
    : "WEEKLY";

  let monthlyDate = null;
  if (p.monthlyDate) {
    const parsed = new Date(p.monthlyDate);
    if (!isNaN(parsed.getTime())) {
      monthlyDate = parsed;
    }
  }

  const hasCustomPeriod = Boolean(p.hasCustomPeriod && p.startDate && p.endDate);
  let startDate = null;
  let endDate = null;
  if (hasCustomPeriod) {
    const parsedStart = new Date(p.startDate);
    const parsedEnd = new Date(p.endDate);
    if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
      if (parsedStart > parsedEnd) {
        throw new Error("Tanggal mulai tidak boleh melebihi tanggal berakhir.");
      }
      startDate = parsedStart;
      endDate = parsedEnd;
    }
  }

  const cleanData = {
    campaignId: p.campaignId ? String(p.campaignId) : null,
    programTitle: sanitizeInput(p.programTitle || "Program Kebaikan Rutin"),
    amount,
    frequency,
    routineType,
    status: "ACTIVE",
    selectedDay: p.selectedDay ? sanitizeInput(p.selectedDay) : null,
    monthlyDate,
    reminderTime: p.reminderTime ? sanitizeInput(p.reminderTime).slice(0, 5) : "05:00",
    hasCustomPeriod,
    startDate,
    endDate,
    donorName: nameVal.sanitized,
    donorEmail: cleanEmail,
    donorPhone: cleanPhone,
    isAnonymous: Boolean(isAnonymous),
  };

  try {
    const createdRecord = await prisma.routineDonation.create({
      data: cleanData,
    });

    return {
      success: true,
      data: [
        {
          id: createdRecord.id,
          programTitle: createdRecord.programTitle,
          amount: createdRecord.amount,
          frequency: createdRecord.frequency,
          status: createdRecord.status,
          hasCustomPeriod: createdRecord.hasCustomPeriod,
          startDate: createdRecord.startDate,
          endDate: createdRecord.endDate,
        },
      ],
      message: "Jadwal donasi rutin Anda berhasil diaktifkan. Terima kasih!",
    };
  } catch (error) {
    console.error("Prisma createRoutineDonations error:", error);
    throw new Error(
      error.message || "Gagal mengaktifkan jadwal donasi rutin. Silakan coba kembali beberapa saat lagi."
    );
  }
}

/**
 * Service to update routine donation status by donor.
 * Validates status, checks existence, and enforces ownership security (IDOR protection).
 *
 * @param {object} params
 * @param {string} params.id - Routine donation record ID
 * @param {string} params.status - New status: ACTIVE, PAUSED, or CANCELLED
 * @param {string} [params.userEmail] - Authenticated user email for ownership verification
 */
export async function updateDonorRoutineDonationStatus({ id, status, userEmail }) {
  if (!id) {
    const error = new Error("ID donasi rutin wajib disertakan.");
    error.statusCode = 400;
    throw error;
  }

  const cleanStatus = sanitizeInput(status || "").toUpperCase();
  if (!["ACTIVE", "PAUSED", "CANCELLED"].includes(cleanStatus)) {
    const error = new Error("Parameter status donasi rutin tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.routineDonation.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Data donasi rutin tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  if (
    userEmail &&
    existing.donorEmail &&
    existing.donorEmail.toLowerCase() !== userEmail.toLowerCase()
  ) {
    const error = new Error("Akses tidak sah untuk mengubah data ini.");
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.routineDonation.update({
    where: { id },
    data: { status: cleanStatus },
  });

  const message =
    cleanStatus === "PAUSED"
      ? "Donasi rutin berhasil dijeda sementara."
      : cleanStatus === "ACTIVE"
      ? "Donasi rutin berhasil diaktifkan kembali."
      : "Donasi rutin berhasil dibatalkan.";

  return {
    success: true,
    message,
    data: updated,
  };
}

