import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/serverAuth";
import { validatePasswordInput } from "@/lib/validator";
import { sendPasswordResetEmail } from "@/services/emailService";
import { globalRateLimiter } from "@/lib/rateLimit";

/**
 * Kebijakan Terpusat Pengaturan Ulang Kata Sandi (SSOT).
 */
export const PASSWORD_RESET_POLICY = {
  TOKEN_EXPIRY_MINUTES: 30,
  DAILY_LIMIT: 3,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 jam
};

/**
 * Mengevaluasi kuota harian permintaan reset kata sandi per alamat email (SRP & SoC).
 * @param {string} email - Alamat email yang meminta reset
 * @returns {{ success: boolean, remaining: number, resetMs: number }}
 */
export function checkDailyPasswordResetLimit(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, remaining: 0, resetMs: 0 };
  }
  const key = `auth_forgot_password_daily:${cleanEmail}`;
  return globalRateLimiter.check(
    key,
    PASSWORD_RESET_POLICY.DAILY_LIMIT,
    PASSWORD_RESET_POLICY.WINDOW_MS
  );
}

/**
 * Mengembalikan kuota rate limit jika terjadi kegagalan sistem internal (Rollback Safety).
 * @param {string} email
 */
export function rollbackDailyPasswordResetLimit(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return;
  const key = `auth_forgot_password_daily:${cleanEmail}`;
  globalRateLimiter.decrement(key);
}

/**
 * Abstraksi akses model PasswordResetToken.
 * Mendukung Prisma model delegate langsung, dengan fallback otomatis ke $queryRaw / $executeRaw
 * jika proses worker Next.js masih menampung instance Prisma Client lama di memori.
 */
const tokenStore = {
  async deleteManyByEmail(email) {
    if (prisma?.passwordResetToken?.deleteMany) {
      return prisma.passwordResetToken.deleteMany({ where: { email } });
    }
    return prisma.$executeRawUnsafe(
      `DELETE FROM "PasswordResetToken" WHERE email = $1`,
      email
    );
  },

  async createToken({ email, tokenHash, expiresAt }) {
    if (prisma?.passwordResetToken?.create) {
      return prisma.passwordResetToken.create({
        data: { email, tokenHash, expiresAt },
      });
    }
    const id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PasswordResetToken" ("id", "email", "tokenHash", "expiresAt", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      id,
      email,
      tokenHash,
      expiresAt
    );
    return { id, email, tokenHash, expiresAt };
  },

  async findByTokenHash(tokenHash) {
    if (prisma?.passwordResetToken?.findUnique) {
      return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    }
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "PasswordResetToken" WHERE "tokenHash" = $1 LIMIT 1`,
      tokenHash
    );
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async deleteById(id) {
    if (prisma?.passwordResetToken?.delete) {
      return prisma.passwordResetToken.delete({ where: { id } }).catch(() => {});
    }
    return prisma.$executeRawUnsafe(
      `DELETE FROM "PasswordResetToken" WHERE id = $1`,
      id
    ).catch(() => {});
  },

  async commitPasswordReset(targetEmail, passwordHash) {
    if (prisma?.passwordResetToken?.deleteMany) {
      return prisma.$transaction([
        prisma.user.update({
          where: { email: targetEmail },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.deleteMany({
          where: { email: targetEmail },
        }),
      ]);
    }

    return prisma.$transaction([
      prisma.user.update({
        where: { email: targetEmail },
        data: { passwordHash },
      }),
      prisma.$executeRawUnsafe(
        `DELETE FROM "PasswordResetToken" WHERE email = $1`,
        targetEmail
      ),
    ]);
  },
};

/**
 * Membuat hash SHA-256 dari token mentah untuk penyimpanan aman di database
 */
function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Memproses permintaan lupa kata sandi:
 * Membuat token aman, mencatat hash ke database, dan mengirimkan email instruksi via Resend.
 *
 * @param {string} email - Alamat email pengguna
 * @param {string} baseUrl - Domain dasar web (contoh: https://pabe.or.id)
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function requestPasswordReset(email, baseUrl = "http://localhost:3000") {
  if (!email || typeof email !== "string") {
    throw new Error("Alamat email wajib diisi.");
  }

  const cleanEmail = email.trim().toLowerCase();

  // Cari data pengguna di database
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, name: true, email: true, isActive: true },
  });

  // Proteksi Anti-User-Enumeration:
  // Jika email tidak terdaftar, tetap kembalikan pesan sukses generik agar penyerang tidak bisa menebak email terdaftar
  if (!user || user.isActive === false) {
    return {
      success: true,
      message: "Jika email Anda terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan.",
    };
  }

  // 1. Generate 64-karakter secure random hex token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_POLICY.TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // 2. Bersihkan token lama untuk email yang sama
  await tokenStore.deleteManyByEmail(cleanEmail);

  // 3. Simpan token baru
  await tokenStore.createToken({
    email: cleanEmail,
    tokenHash,
    expiresAt,
  });

  // 4. Siapkan URL reset
  const sanitizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const resetUrl = `${sanitizedBaseUrl}/reset-password?token=${rawToken}`;

  // 5. Kirim email via Resend
  await sendPasswordResetEmail({
    to: cleanEmail,
    name: user.name,
    resetUrl,
  });

  return {
    success: true,
    message: "Tautan pengaturan ulang kata sandi telah dikirimkan ke email Anda.",
  };
}

/**
 * Memvalidasi apakah token reset masih berlaku dan belum kedaluwarsa
 * @param {string} rawToken - Token mentah dari URL query
 * @returns {Promise<{ isValid: boolean, email?: string, message?: string }>}
 */
export async function verifyPasswordResetToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") {
    return {
      isValid: false,
      message: "Tautan pengaturan ulang kata sandi tidak valid atau telah kedaluwarsa.",
    };
  }

  const tokenHash = hashToken(rawToken.trim());

  const record = await tokenStore.findByTokenHash(tokenHash);

  if (!record) {
    return {
      isValid: false,
      message: "Tautan pengaturan ulang kata sandi tidak valid atau telah kedaluwarsa.",
    };
  }

  if (new Date() > record.expiresAt) {
    // Hapus token yang sudah kedaluwarsa
    await tokenStore.deleteById(record.id);
    return {
      isValid: false,
      message: "Tautan pengaturan ulang kata sandi telah kedaluwarsa. Silakan ajukan kembali.",
    };
  }

  return {
    isValid: true,
    email: record.email,
  };
}

/**
 * Memperbarui kata sandi pengguna dengan token yang sah (Single-use & Atomic)
 * @param {string} rawToken - Token mentah dari URL
 * @param {string} newPassword - Kata sandi baru
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function resetPasswordWithToken(rawToken, newPassword) {
  const verification = await verifyPasswordResetToken(rawToken);
  if (!verification.isValid) {
    throw new Error(verification.message);
  }

  const passwordCheck = validatePasswordInput(newPassword, "Kata sandi baru");
  if (!passwordCheck.isValid) {
    throw new Error(passwordCheck.message);
  }

  const cleanPassword = newPassword.trim();
  const passwordHash = hashPassword(cleanPassword);
  const targetEmail = verification.email;

  // Lakukan pembaruan kata sandi dan hapus token secara atomik
  await tokenStore.commitPasswordReset(targetEmail, passwordHash);

  return {
    success: true,
    message: "Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru Anda.",
  };
}
