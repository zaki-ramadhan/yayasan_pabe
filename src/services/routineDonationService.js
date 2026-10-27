import prisma from "@/lib/prisma";
import {
  sanitizeInput,
  validateName,
  validatePhone,
  validateEmail,
  DONATION_LIMITS,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";

/**
 * Service to register routine donations directly into PostgreSQL via Prisma.
 * Uses atomic transaction for multiple programs.
 */
export async function createRoutineDonations({
  donorName,
  donorEmail = "",
  donorPhone,
  isAnonymous = false,
  programs = [],
}) {
  const nameVal = validateName(donorName, isAnonymous);
  if (!nameVal.isValid) throw new Error(nameVal.message);

  const phoneVal = validatePhone(donorPhone);
  if (!phoneVal.isValid) throw new Error(phoneVal.message);

  let cleanEmail = null;
  if (donorEmail && donorEmail.trim()) {
    const emailVal = await verifyEmailDomainDns(donorEmail);
    if (!emailVal.isValid) throw new Error(emailVal.message);
    cleanEmail = emailVal.sanitized;
  }

  if (!Array.isArray(programs) || programs.length === 0) {
    throw new Error("Minimal harus memilih 1 program donasi rutin.");
  }

  if (programs.length > 2) {
    throw new Error("Maksimal 2 program dalam satu komitmen donasi rutin.");
  }

  const cleanPrograms = programs.map((p, idx) => {
    const routineType = p.routineType === "REMINDER_ONLY" ? "REMINDER_ONLY" : "AUTO_DONATION";
    const amount = Number(p.amount) || 0;

    if (routineType === "AUTO_DONATION") {
      if (amount < DONATION_LIMITS.MIN_AMOUNT) {
        throw new Error(
          `Nominal program ${idx + 1} minimal Rp ${DONATION_LIMITS.MIN_AMOUNT.toLocaleString("id-ID")}`
        );
      }
      if (amount > DONATION_LIMITS.MAX_AMOUNT) {
        throw new Error(
          `Nominal program ${idx + 1} maksimal Rp ${DONATION_LIMITS.MAX_AMOUNT.toLocaleString("id-ID")}`
        );
      }
    }

    const frequency = ["DAILY", "WEEKLY", "MONTHLY"].includes(p.frequency)
      ? p.frequency
      : "DAILY";

    let monthlyDate = null;
    if (p.monthlyDate) {
      const parsed = new Date(p.monthlyDate);
      if (!isNaN(parsed.getTime())) {
        monthlyDate = parsed;
      }
    }

    return {
      campaignId: p.campaignId ? String(p.campaignId) : null,
      programTitle: sanitizeInput(p.programTitle || "Program Kebaikan Rutin"),
      amount,
      frequency,
      routineType,
      status: "ACTIVE",
      selectedDay: p.selectedDay ? sanitizeInput(p.selectedDay) : null,
      monthlyDate,
      reminderTime: p.reminderTime ? sanitizeInput(p.reminderTime).slice(0, 5) : "05:00",
      donorName: nameVal.sanitized,
      donorEmail: cleanEmail,
      donorPhone: phoneVal.sanitized,
      isAnonymous: Boolean(isAnonymous),
    };
  });

  try {
    const createdRecords = await prisma.$transaction(
      cleanPrograms.map((data) =>
        prisma.routineDonation.create({
          data,
        })
      )
    );

    return {
      success: true,
      data: createdRecords.map((r) => ({
        id: r.id,
        programTitle: r.programTitle,
        amount: r.amount,
        frequency: r.frequency,
        status: r.status,
      })),
      message: "Jadwal donasi rutin Anda berhasil diaktifkan dan tersimpan di database!",
    };
  } catch (error) {
    console.error("Prisma createRoutineDonations error:", error);
    throw new Error(
      error.message || "Gagal mengaktifkan jadwal donasi rutin. Silakan coba kembali beberapa saat lagi."
    );
  }
}
