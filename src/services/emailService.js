import fs from "fs";
import path from "path";
import {
  buildPasswordResetEmailHtml,
  PASSWORD_RESET_EMAIL_SUBJECT,
} from "@/templates/emails/passwordResetEmailTemplate";
import {
  buildAccountActivationEmailHtml,
  ACCOUNT_ACTIVATION_EMAIL_SUBJECT,
} from "@/templates/emails/accountActivationEmailTemplate";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Mengambil konfigurasi Resend dari environment variable
 */
function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY || "";
  // Jika belum set domain khusus, Resend mengizinkan pengujian via onboarding@resend.dev
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "Yayasan Payung Berkah <onboarding@resend.dev>";

  return { apiKey, fromEmail };
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let hasEnsuredR2Logo = false;

/**
 * Mengambil atau menyinkronkan URL publik logo yayasan di Cloudflare R2
 * Menjamin email bebas dari kotak lampiran dan berukuran ringan (~3KB) seperti Postman
 * @returns {Promise<string>}
 */
export async function getPublicEmailLogoUrl() {
  if (process.env.EMAIL_LOGO_URL) {
    return process.env.EMAIL_LOGO_URL;
  }

  const r2PublicUrl = (
    process.env.R2_PUBLIC_URL || "https://pub-d695853be49c485484cd7799dc192352.r2.dev"
  ).replace(/\/+$/, "");
  const logoKey = "branding/logo-ypabe.png";
  const defaultUrl = `${r2PublicUrl}/${logoKey}`;

  if (hasEnsuredR2Logo) {
    return defaultUrl;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "ypabe-storage";

  if (accountId && accessKeyId && secretAccessKey) {
    try {
      const pngPath = path.join(process.cwd(), "public", "img", "branding", "logo-ypabe.png");
      if (fs.existsSync(pngPath)) {
        const fileBuffer = fs.readFileSync(pngPath);
        const s3Client = new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId, secretAccessKey },
        });

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: logoKey,
            Body: fileBuffer,
            ContentType: "image/png",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
        hasEnsuredR2Logo = true;
      }
    } catch (err) {
      console.warn("[EmailService] Catatan sinkronisasi logo ke R2:", err.message);
    }
  }

  return defaultUrl;
}

/**
 * Mengirim email transaksional via Resend REST API
 * @param {object} params
 * @param {string} params.to - Alamat email penerima
 * @param {string} params.subject - Subjek email
 * @param {string} params.html - Konten email HTML
 * @param {Array<object>} [params.attachments] - Berkas lampiran / inline CID
 * @returns {Promise<{ success: boolean, id?: string, simulated?: boolean }>}
 */
export async function sendEmail({ to, subject, html, attachments }) {
  const { apiKey, fromEmail } = getResendConfig();

  // Mode Fallback/Simulasi jika API key belum dikonfigurasi di .env
  if (!apiKey) {
    const urlMatch = html ? html.match(/href="([^"]*token=[^"]*)"/) : null;
    const detectedUrl = urlMatch ? urlMatch[1] : null;

    console.info(
      `\n======================================================\n` +
      `[SIMULASI EMAIL RESEND] RESEND_API_KEY belum dikonfigurasi di .env\n` +
      `Kepada : ${to}\n` +
      `Subjek : ${subject}\n` +
      (detectedUrl ? `Tautan : ${detectedUrl}\n` : "") +
      `Waktu  : ${new Date().toISOString()}\n` +
      `======================================================\n`
    );
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      from: fromEmail,
      to: [to],
      subject,
      html,
    };

    if (Array.isArray(attachments) && attachments.length > 0) {
      payload.attachments = attachments;
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[EmailService] Resend API Error:", data);
      const rawMsg = data?.message || "";
      if (rawMsg.includes("You can only send testing emails")) {
        throw new Error(
          "Akun Resend masih dalam mode uji coba (hanya bisa kirim ke email pemilik akun). Untuk kirim ke email lain, verifikasi domain yayasan di resend.com/domains."
        );
      }
      throw new Error(rawMsg || "Gagal mengirimkan email melalui Resend.");
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error("[EmailService] Gagal menghubungi layanan Resend:", err.message);
    throw err;
  }
}

/**
 * Mengirimkan email tautan instruksi reset kata sandi
 * @param {object} params
 * @param {string} params.to - Email pengguna
 * @param {string} params.name - Nama pengguna
 * @param {string} params.resetUrl - Tautan reset kata sandi lengkap
 */
export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const logoUrl = await getPublicEmailLogoUrl();
  const html = buildPasswordResetEmailHtml({ name, resetUrl, logoUrl });

  return sendEmail({
    to,
    subject: PASSWORD_RESET_EMAIL_SUBJECT,
    html,
  });
}

/**
 * Mengirimkan email tautan aktivasi akun pendaftar baru
 * @param {object} params
 * @param {string} params.to - Email pengguna
 * @param {string} params.name - Nama pengguna
 * @param {string} params.activationUrl - Tautan aktivasi akun lengkap
 */
export async function sendAccountActivationEmail({ to, name, activationUrl }) {
  const logoUrl = await getPublicEmailLogoUrl();
  const html = buildAccountActivationEmailHtml({ name, activationUrl, logoUrl });

  return sendEmail({
    to,
    subject: ACCOUNT_ACTIVATION_EMAIL_SUBJECT,
    html,
  });
}
