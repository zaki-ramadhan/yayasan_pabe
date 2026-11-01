import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendAccountActivationEmail } from "@/services/emailService";
import { globalRateLimiter } from "@/lib/rateLimit";

/**
 * Kebijakan Terpusat Pengiriman Email Aktivasi Akun (SSOT).
 */
export const ACCOUNT_ACTIVATION_POLICY = {
  TOKEN_EXPIRY_HOURS: 24,
  DAILY_RESEND_LIMIT: 3,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 jam
};

/**
 * Mengevaluasi kuota harian kirim ulang email aktivasi per alamat email (SRP & SoC).
 * @param {string} email
 * @returns {{ success: boolean, remaining: number, resetMs: number }}
 */
export function checkDailyActivationResendLimit(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, remaining: 0, resetMs: 0 };
  }
  const key = `auth_resend_activation_daily:${cleanEmail}`;
  return globalRateLimiter.check(
    key,
    ACCOUNT_ACTIVATION_POLICY.DAILY_RESEND_LIMIT,
    ACCOUNT_ACTIVATION_POLICY.WINDOW_MS
  );
}

/**
 * Mengembalikan kuota rate limit jika terjadi kegagalan sistem internal (Rollback Safety).
 * @param {string} email
 */
export function rollbackDailyActivationResendLimit(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return;
  const key = `auth_resend_activation_daily:${cleanEmail}`;
  globalRateLimiter.decrement(key);
}

/**
 * Abstraksi akses model AccountActivationToken dengan self-healing DDL fallback.
 * Memastikan kompatibilitas penuh meskipun worker proses Next.js menampung Prisma Client lama di memori.
 */
const tokenStore = {
  async deleteManyByEmail(email) {
    if (prisma?.accountActivationToken?.deleteMany) {
      return prisma.accountActivationToken.deleteMany({ where: { email } });
    }
    return prisma.$executeRawUnsafe(
      `DELETE FROM "AccountActivationToken" WHERE email = $1`,
      email
    ).catch(() => {});
  },

  async createToken({ email, tokenHash, expiresAt }) {
    if (prisma?.accountActivationToken?.create) {
      return prisma.accountActivationToken.create({
        data: { email, tokenHash, expiresAt },
      });
    }

    const id = crypto.randomUUID();
    // Self-healing migration jika tabel belum dibuat di PostgreSQL
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "AccountActivationToken" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "tokenHash" TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "AccountActivationToken_email_idx" ON "AccountActivationToken"("email");
      CREATE INDEX IF NOT EXISTS "AccountActivationToken_tokenHash_idx" ON "AccountActivationToken"("tokenHash");
      INSERT INTO "AccountActivationToken" ("id", "email", "tokenHash", "expiresAt", "createdAt") 
      VALUES ($1, $2, $3, $4, NOW())`,
      id,
      email,
      tokenHash,
      expiresAt
    );
    return { id, email, tokenHash, expiresAt };
  },

  async findByTokenHash(tokenHash) {
    if (prisma?.accountActivationToken?.findUnique) {
      return prisma.accountActivationToken.findUnique({ where: { tokenHash } });
    }
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "AccountActivationToken" WHERE "tokenHash" = $1 LIMIT 1`,
      tokenHash
    );
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async deleteById(id) {
    if (prisma?.accountActivationToken?.delete) {
      return prisma.accountActivationToken.delete({ where: { id } }).catch(() => {});
    }
    return prisma.$executeRawUnsafe(
      `DELETE FROM "AccountActivationToken" WHERE id = $1`,
      id
    ).catch(() => {});
  },
};

/**
 * Membuat token aktivasi acak dan menyimpannya dalam bentuk hash ke basis data
 * @param {string} email
 * @returns {Promise<{ rawToken: string, expiresAt: Date }>}
 */
export async function createActivationToken(email) {
  const cleanEmail = email.trim().toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + ACCOUNT_ACTIVATION_POLICY.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Bersihkan token lama untuk email ini agar hanya ada 1 token aktif terkini
  await tokenStore.deleteManyByEmail(cleanEmail);

  await tokenStore.createToken({
    email: cleanEmail,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
}

/**
 * Menjalankan alur pengiriman email aktivasi akun ke pengguna
 * @param {object} params
 * @param {string} params.email - Email penerima
 * @param {string} params.name - Nama pengguna
 * @param {string} [params.originUrl] - Base URL aplikasi
 */
export async function sendActivationEmailWorkflow({ email, name, originUrl }) {
  const cleanEmail = email.trim().toLowerCase();
  const { rawToken } = await createActivationToken(cleanEmail);

  const baseUrl = (
    originUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const activationUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;

  return sendAccountActivationEmail({
    to: cleanEmail,
    name,
    activationUrl,
  });
}

/**
 * Memvalidasi token aktivasi dan mengaktifkan akun pengguna di basis data
 * @param {string} rawToken
 * @returns {Promise<{ success: boolean, message: string, email?: string }>}
 */
export async function verifyActivationToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length < 16) {
    return {
      success: false,
      message: "Tautan aktivasi tidak valid.",
    };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
  const tokenRecord = await tokenStore.findByTokenHash(tokenHash);

  if (!tokenRecord) {
    return {
      success: false,
      message: "Tautan aktivasi tidak ditemukan atau sudah pernah digunakan.",
    };
  }

  const isExpired = new Date(tokenRecord.expiresAt).getTime() < Date.now();
  if (isExpired) {
    await tokenStore.deleteById(tokenRecord.id);
    return {
      success: false,
      message: "Tautan aktivasi telah kedaluwarsa. Silakan minta kirim ulang email aktivasi.",
    };
  }

  const cleanEmail = tokenRecord.email.toLowerCase();

  // Aktifkan akun pengguna di database
  try {
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { isActive: true },
    });
  } catch (updateErr) {
    console.error("[AccountActivation] Gagal mengaktifkan user di DB:", updateErr.message);
    return {
      success: false,
      message: "Gagal mengaktifkan akun. Silakan hubungi admin yayasan.",
    };
  }

  // Hapus token setelah berhasil digunakan (One-Time Use)
  await tokenStore.deleteById(tokenRecord.id);

  return {
    success: true,
    message: "Akun Anda berhasil diaktifkan! Silakan masuk.",
    email: cleanEmail,
  };
}

/**
 * Mengirim ulang email aktivasi untuk pengguna yang belum aktif
 * @param {string} email
 * @param {string} [originUrl]
 * @returns {Promise<{ success: boolean, message: string, alreadyActive?: boolean }>}
 */
export async function resendActivationWorkflow(email, originUrl) {
  if (!email || typeof email !== "string" || !email.trim()) {
    throw new Error("Alamat email wajib diisi.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, name: true, email: true, isActive: true },
  });

  // Anti-Enumeration: Jangan bocorkan jika email tidak terdaftar
  if (!user) {
    return {
      success: true,
      message: "Jika email Anda terdaftar, tautan aktivasi baru telah dikirimkan ke kotak masuk Anda.",
    };
  }

  if (user.isActive) {
    return {
      success: true,
      alreadyActive: true,
      message: "Akun Anda sudah berstatus aktif. Silakan langsung masuk ke akun Anda.",
    };
  }

  await sendActivationEmailWorkflow({
    email: user.email,
    name: user.name,
    originUrl,
  });

  return {
    success: true,
    message: "Tautan aktivasi baru telah dikirimkan. Silakan periksa inbox email Anda.",
  };
}
