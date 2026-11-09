import crypto from "crypto";
import prisma from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2Storage";
import {
  sanitizeName,
  sanitizeCity,
  sanitizePhone,
  sanitizeAddress,
  sanitizeImageUrl,
  validateName,
  validatePhone,
  validatePasswordInput,
} from "@/lib/security";
import { DEMO_USERS } from "@/services/authService";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export async function getDonorProfile({ userEmail, userId }) {
  if (!userEmail && !userId) {
    throw new Error("Identitas pengguna tidak ditemukan.");
  }

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userEmail ? [{ email: userEmail.trim().toLowerCase() }] : []),
          ...(userId ? [{ id: userId }] : []),
        ],
      },
    });

    if (!user && userEmail) {
      const demoMatch = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === userEmail.trim().toLowerCase()
      );

      if (demoMatch) {
        user = await prisma.user.create({
          data: {
            id: demoMatch.id,
            name: demoMatch.name,
            email: demoMatch.email,
            username: demoMatch.username,
            role: demoMatch.role,
            title: demoMatch.title,
            phone: demoMatch.phone,
            avatar: demoMatch.avatar,
            salutation: "",
            city: "Bandung",
            address: "Jl. Riau No. 45, Bandung, Jawa Barat",
          },
        });
      }
    }

    if (!user) {
      throw new Error("Pengguna tidak ditemukan di database.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      title: user.title || "Donatur",
      salutation: user.salutation || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      customAvatar: user.customAvatar || "",
      providerAvatar:
        user.providerAvatar ||
        (user.provider === "GOOGLE" ||
        user.provider === "FACEBOOK" ||
        user.avatar?.includes("googleusercontent.com")
          ? user.avatar
          : ""),
      provider: user.provider || "CREDENTIALS",
      hasPassword: Boolean(user.passwordHash),
      city: user.city || "",
      address: user.address || "",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getDonorProfile in donorProfileService:", error);
    throw error;
  }
}

export async function updateDonorProfile({ userEmail, profileData }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  const updatePayload = {};

  if (profileData.name !== undefined) {
    const cleanName = sanitizeName(profileData.name).trim();
    const nameValidation = validateName(cleanName);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }
    updatePayload.name = cleanName;
  }

  if (profileData.city !== undefined) {
    updatePayload.city = sanitizeCity(profileData.city).trim();
  }

  if (profileData.address !== undefined) {
    updatePayload.address = sanitizeAddress(profileData.address).trim();
  }

  if (profileData.phone !== undefined) {
    const cleanPhone = sanitizePhone(profileData.phone).trim();
    if (cleanPhone) {
      const phoneValidation = validatePhone(cleanPhone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
    }
    updatePayload.phone = cleanPhone;
  }

  let existingUser = null;
  if (
    profileData.avatar !== undefined ||
    profileData.customAvatar !== undefined
  ) {
    existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { avatar: true, customAvatar: true },
    });
  }

  if (profileData.customAvatar !== undefined) {
    const cleanCustomAvatar = sanitizeImageUrl(profileData.customAvatar);
    updatePayload.customAvatar = cleanCustomAvatar;

    // Hapus berkas R2 lama HANYA jika foto kustom diganti dengan berkas baru atau dihapus permanen
    if (existingUser?.customAvatar && existingUser.customAvatar !== cleanCustomAvatar) {
      await deleteFromR2(existingUser.customAvatar);
    }
  }

  if (profileData.avatar !== undefined) {
    updatePayload.avatar = sanitizeImageUrl(profileData.avatar);
    // Catatan: Jika avatar berganti ke preset, foto kustom di R2 tetap disimpan dengan aman
  }

  try {
    const updated = await prisma.user.update({
      where: { email: cleanEmail },
      data: updatePayload,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      role: updated.role,
      title: updated.title,
      salutation: "",
      phone: updated.phone || "",
      avatar: updated.avatar || "",
      customAvatar: updated.customAvatar || "",
      providerAvatar: updated.providerAvatar || "",
      provider: updated.provider || "CREDENTIALS",
      hasPassword: Boolean(updated.passwordHash),
      city: updated.city || "",
      address: updated.address || "",
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error updateDonorProfile in donorProfileService:", error);
    throw error;
  }
}

export async function updateDonorPassword({ userEmail, oldPassword, newPassword }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }

  const newPassValidation = validatePasswordInput(newPassword, "Kata sandi baru");
  if (!newPassValidation.isValid) {
    throw new Error(newPassValidation.message);
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  if (!user.passwordHash) {
    throw new Error(
      `Akun ini terdaftar murni menggunakan penyedia ${user.provider || "OAuth"} dan belum memiliki kata sandi manual.`
    );
  }

  if (!oldPassword || !oldPassword.trim()) {
    throw new Error("Kata sandi saat ini wajib diisi untuk verifikasi keamanan.");
  }

  const isValid = verifyPassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Kata sandi saat ini tidak cocok.");
  }

  if (oldPassword && oldPassword === newPassword) {
    throw new Error("Kata sandi baru harus berbeda dari kata sandi saat ini.");
  }

  const newHash = hashPassword(newPassword);

  await prisma.user.update({
    where: { email: cleanEmail },
    data: { passwordHash: newHash },
  });

  return { success: true, message: "Kata sandi akun Anda berhasil diperbarui." };
}

/**
 * Meng-anonimkan akun donatur sesuai UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
 * Menghapus/menyamarkan seluruh data PII (nama, email, hp, alamat, avatar)
 * namun mempertahankan integritas buku besar transaksi keuangan (SSOT ledger audit).
 *
 * @param {object} params
 * @param {string} [params.userId]
 * @param {string} [params.userEmail]
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function anonymizeDonorAccount({ userId, userEmail }) {
  if (!userId && !userEmail) {
    throw new Error("Identitas akun wajib disertakan.");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(userEmail ? [{ email: userEmail.trim().toLowerCase() }] : []),
      ],
    },
  });

  if (!user) {
    throw new Error("Akun pengguna tidak ditemukan.");
  }

  if (user.role && user.role !== "DONOR") {
    throw new Error("Akun pengurus atau staf yayasan tidak dapat dianonimkan secara mandiri.");
  }

  if (user.customAvatar && user.customAvatar.startsWith("/api/media/")) {
    try {
      await deleteFromR2(user.customAvatar);
    } catch (r2Err) {
      console.warn("Gagal menghapus avatar custom R2 saat anonimisasi akun:", r2Err?.message);
    }
  }

  // Bersihkan berkas CV lamaran kerja jika donatur pernah melamar lowongan kerja
  if (user.email) {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: { email: user.email },
        select: { resumeUrl: true },
      });
      for (const app of applications) {
        if (app.resumeUrl && app.resumeUrl.startsWith("/api/media/")) {
          await deleteFromR2(app.resumeUrl).catch(() => {});
        }
      }
    } catch (appErr) {
      console.warn("Gagal membersihkan resume pelamar dari R2:", appErr?.message);
    }
  }

  const anonymizedEmail = `deleted_${user.id}_${Date.now()}@anonymized.pabe.id`;
  const anonymizedUsername = `anon_${user.id.slice(-8)}_${Date.now()}`;

  await prisma.$transaction(async (tx) => {
    // Ambil daftar id RoutineDonation milik donatur untuk membatalkan antrean notifikasi terkait
    const userRoutines = await tx.routineDonation.findMany({
      where: {
        OR: [
          { donorEmail: user.email },
          ...(user.phone ? [{ donorPhone: user.phone }] : []),
        ],
      },
      select: { id: true },
    });
    const routineIds = userRoutines.map((r) => r.id);

    // 1. Batalkan seluruh jadwal komitmen donasi rutin yang aktif
    await tx.routineDonation.updateMany({
      where: {
        OR: [
          { donorEmail: user.email },
          ...(user.phone ? [{ donorPhone: user.phone }] : []),
        ],
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      data: {
        status: "CANCELLED",
      },
    });

    // 2. Batalkan seluruh antrean notifikasi (NotificationQueue) yang belum terkirim
    if (routineIds.length > 0 || user.phone) {
      await tx.notificationQueue.deleteMany({
        where: {
          OR: [
            ...(routineIds.length > 0 ? [{ routineDonationId: { in: routineIds } }] : []),
            ...(user.phone ? [{ recipientPhone: user.phone }] : []),
          ],
          status: "PENDING",
        },
      });
    }

    // 3. Hapus token keamanan yang masih aktif (PasswordResetToken & AccountActivationToken)
    if (user.email) {
      await tx.passwordResetToken.deleteMany({
        where: { email: user.email },
      });
      await tx.accountActivationToken.deleteMany({
        where: { email: user.email },
      });
    }

    // 4. Samarkan data donatur pada histori donasi finansial & sembunyikan doa dari publik
    await tx.donation.updateMany({
      where: {
        donorEmail: user.email,
      },
      data: {
        isAnonymous: true,
        donorName: "Hamba Allah",
        donorEmail: anonymizedEmail,
        donorPhone: null,
        donorAvatar: null,
        isPrayerHidden: true, // Praktik privasi: sembunyikan doa dari feed publik
      },
    });

    // 5. Samarkan data pendaftaran relawan (Volunteer) jika pernah mendaftar
    if (user.email || user.phone) {
      await tx.volunteer.updateMany({
        where: {
          OR: [
            ...(user.email ? [{ email: user.email }] : []),
            ...(user.phone ? [{ phone: user.phone }] : []),
          ],
        },
        data: {
          fullName: "Relawan Anonim (PDP)",
          email: anonymizedEmail,
          phone: "000000000000",
          motivation: "Data motivasi telah dihapus sesuai ketentuan UU PDP No. 27/2022.",
        },
      });
    }

    // 6. Samarkan data lamaran karier (JobApplication)
    if (user.email || user.phone) {
      await tx.jobApplication.updateMany({
        where: {
          OR: [
            ...(user.email ? [{ email: user.email }] : []),
            ...(user.phone ? [{ phone: user.phone }] : []),
          ],
        },
        data: {
          fullName: "Pelamar Anonim (PDP)",
          email: anonymizedEmail,
          phone: "000000000000",
          coverLetter: "Data surat lamaran telah dihapus sesuai ketentuan UU PDP No. 27/2022.",
          resumeUrl: null,
          linkedinUrl: null,
          portfolioUrl: null,
        },
      });
    }

    // 7. Anonimkan data profil pengguna
    await tx.user.update({
      where: { id: user.id },
      data: {
        name: "Donatur Anonim (PDP)",
        email: anonymizedEmail,
        username: anonymizedUsername,
        phone: null,
        city: null,
        address: null,
        avatar: null,
        customAvatar: null,
        providerAvatar: null,
        passwordHash: null,
        isActive: false,
      },
    });

    // 8. Catat ke Activity Log sistem
    await tx.activityLog.create({
      data: {
        action: "PDP_ACCOUNT_ANONYMIZED",
        targetType: "USER",
        targetId: user.id,
        description: `Akun donatur ${user.id} telah dianonimkan secara komprehensif sesuai UU Pelindungan Data Pribadi (UU PDP No. 27/2022).`,
        userName: "SYSTEM_PDP",
        userRole: "SYSTEM",
      },
    });
  });

  return {
    success: true,
    message: "Permohonan hak penghapusan data pribadi (UU PDP) berhasil diproses. Seluruh data identitas Anda telah disamarkan secara permanen.",
  };
}
