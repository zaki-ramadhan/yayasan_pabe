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
import {
  buildRoutineDonationInvoiceEmailHtml,
  getRoutineInvoiceEmailSubject,
} from "@/templates/emails/routineDonationInvoiceEmailTemplate";
import { buildRoutineCompletionEmailHtml } from "@/templates/emails/routineCompletionEmailTemplate";
import { buildRoutineRolloverEmailHtml } from "@/templates/emails/routineRolloverEmailTemplate";
import { buildRoutinePausedDueToUnpaidEmailHtml } from "@/templates/emails/routinePausedDueToUnpaidEmailTemplate";
import {
  buildDonationReceiptEmailHtml,
  getDonationReceiptEmailSubject,
} from "@/templates/emails/donationReceiptEmailTemplate";
import {
  buildVolunteerRegistrationEmailHtml,
  VOLUNTEER_REGISTRATION_EMAIL_SUBJECT,
} from "@/templates/emails/volunteerRegistrationEmailTemplate";
import {
  buildVolunteerApprovalEmailHtml,
  VOLUNTEER_APPROVAL_EMAIL_SUBJECT,
} from "@/templates/emails/volunteerApprovalEmailTemplate";
import {
  buildCareerApplicationEmailHtml,
  getCareerApplicationEmailSubject,
} from "@/templates/emails/careerApplicationEmailTemplate";

const RESEND_API_URL = "https://api.resend.com/emails";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Mengambil konfigurasi Email (Resend & Brevo) dari environment variable
 */
export function getEmailConfig() {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const brevoApiKey = process.env.BREVO_API_KEY || "";
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.BREVO_FROM_EMAIL ||
    "Yayasan Payung Berkah <noreply@pabe.or.id>";

  return { resendApiKey, brevoApiKey, fromEmail };
}

/**
 * Backward compatibility konfigurasi Resend
 */
export function getResendConfig() {
  const config = getEmailConfig();
  return { apiKey: config.resendApiKey, fromEmail: config.fromEmail };
}

/**
 * Parsing format "Nama Pengirim <email@domain.com>" untuk payload Brevo
 * @param {string} fromStr
 * @returns {{ name: string, email: string }}
 */
export function parseEmailSender(fromStr) {
  const match = (fromStr || "").match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "Yayasan Payung Berkah", email: (fromStr || "").trim() || "noreply@pabe.or.id" };
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let hasEnsuredR2Logo = false;

/**
 * Mengambil atau menyinkronkan URL publik logo yayasan di Cloudflare R2
 * Menjamin email bebas dari kotak lampiran dan berukuran ringan (~3KB) seperti Postman
 * @returns {Promise<string>}
 */
export async function getPublicEmailLogoUrl() {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return "https://pub-d695853be49c485484cd7799dc192352.r2.dev/branding/logo-ypabe.png";
  }

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
 * Kirim email via Resend REST API
 */
async function sendViaResend({ apiKey, fromEmail, to, subject, html, attachments }) {
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[EmailService] Resend API Error:", data);
    const rawMsg = data?.message || "";
    let errMessage = rawMsg || "Gagal mengirimkan email melalui Resend.";
    if (rawMsg.includes("You can only send testing emails")) {
      errMessage =
        "Akun Resend masih dalam mode uji coba (hanya bisa kirim ke email pemilik akun). Untuk kirim ke email lain, verifikasi domain yayasan di resend.com/domains.";
    }
    const error = new Error(errMessage);
    error.status = response.status;
    error.provider = "resend";
    throw error;
  }

  return { success: true, id: data.id, provider: "resend" };
}

/**
 * Kirim email via Brevo REST API
 */
async function sendViaBrevo({ apiKey, fromEmail, to, subject, html, attachments }) {
  const sender = parseEmailSender(fromEmail);
  const payload = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (Array.isArray(attachments) && attachments.length > 0) {
    payload.attachment = attachments.map((att) => {
      if (att.content) {
        return { name: att.filename || att.name || "attachment", content: att.content };
      }
      if (att.path) {
        return { url: att.path, name: att.filename || att.name || "attachment" };
      }
      return att;
    });
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[EmailService] Brevo API Error:", data);
    const rawMsg = data?.message || data?.error || "";
    const error = new Error(rawMsg || "Gagal mengirimkan email melalui Brevo.");
    error.status = response.status;
    error.provider = "brevo";
    throw error;
  }

  return { success: true, id: data.messageId || data.id, provider: "brevo" };
}

/**
 * Mengirim email transaksional dengan arsitektur Dual-Provider (Resend + Brevo Failover)
 * - Jalur Utama: Resend (100 email/hari)
 * - Jalur Failover/Cadangan: Brevo (300 email/hari) saat Resend limit (429) atau error
 * - Total kapasitas gratis harian: 400 email/hari
 *
 * @param {object} params
 * @param {string} params.to - Alamat email penerima
 * @param {string} params.subject - Subjek email
 * @param {string} params.html - Konten email HTML
 * @param {Array<object>} [params.attachments] - Berkas lampiran / inline CID
 * @returns {Promise<{ success: boolean, id?: string, provider?: string, failover?: boolean, simulated?: boolean }>}
 */
export async function sendEmail({ to, subject, html, attachments }) {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return { success: true, id: `test_email_${Date.now()}`, provider: "mock_test" };
  }

  const { resendApiKey, brevoApiKey, fromEmail } = getEmailConfig();

  // Mode Fallback/Simulasi jika belum ada satupun API key yang dikonfigurasi di .env
  if (!resendApiKey && !brevoApiKey) {
    const urlMatch = html ? html.match(/href="([^"]*token=[^"]*)"/) : null;
    const detectedUrl = urlMatch ? urlMatch[1] : null;

    console.info(
      `\n======================================================\n` +
      `[SIMULASI EMAIL] RESEND_API_KEY / BREVO_API_KEY belum dikonfigurasi di .env\n` +
      `Kepada : ${to}\n` +
      `Subjek : ${subject}\n` +
      (detectedUrl ? `Tautan : ${detectedUrl}\n` : "") +
      `Waktu  : ${new Date().toISOString()}\n` +
      `======================================================\n`
    );
    return { success: true, simulated: true };
  }

  // 1. Coba jalur utama: Resend
  if (resendApiKey) {
    try {
      return await sendViaResend({
        apiKey: resendApiKey,
        fromEmail,
        to,
        subject,
        html,
        attachments,
      });
    } catch (resendErr) {
      console.warn(`[EmailService] Resend gagal (${resendErr.message}).`);

      // 2. Jika Brevo tersedia, aktifkan failover otomatis
      if (brevoApiKey) {
        console.info(`[EmailService] Mengaktifkan failover otomatis ke Brevo untuk ${to}...`);
        try {
          const brevoResult = await sendViaBrevo({
            apiKey: brevoApiKey,
            fromEmail,
            to,
            subject,
            html,
            attachments,
          });
          return { ...brevoResult, failover: true };
        } catch (brevoErr) {
          console.error("[EmailService] Failover ke Brevo juga gagal:", brevoErr.message);
          throw new Error(
            `Pengiriman email gagal pada kedua provider (Resend: ${resendErr.message}; Brevo: ${brevoErr.message})`
          );
        }
      }

      // Jika Brevo tidak dikonfigurasi, lemparkan error asli Resend
      throw resendErr;
    }
  }

  // 3. Jika hanya Brevo yang dikonfigurasi
  return sendViaBrevo({
    apiKey: brevoApiKey,
    fromEmail,
    to,
    subject,
    html,
    attachments,
  });
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

/**
 * Mengirimkan email invoice atau pengingat donasi rutin resmi ke donatur
 * @param {object} params
 * @param {string} params.to - Alamat email donatur
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {number} params.amount - Nominal donasi
 * @param {string} params.frequencyText - Keterangan jadwal
 * @param {string|null} [params.invoiceId] - ID tagihan jika auto-invoice
 * @param {string} params.actionUrl - Tautan bayar QRIS / program
 * @param {"AUTO_DONATION" | "REMINDER_ONLY"} [params.routineType="AUTO_DONATION"]
 */
export async function sendRoutineDonationEmail({
  to,
  donorName,
  programTitle,
  amount,
  frequencyText = "Setiap Pekan",
  invoiceId = null,
  actionUrl,
  routineType = "AUTO_DONATION",
  paymentChannel = "qris",
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = getRoutineInvoiceEmailSubject(programTitle, invoiceId);
  const html = buildRoutineDonationInvoiceEmailHtml({
    donorName,
    programTitle,
    amount,
    frequencyText,
    invoiceId,
    actionUrl,
    routineType,
    paymentChannel,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}



/**
 * Mengirimkan email apresiasi & pemberitahuan penutupan program donasi rutin
 * @param {object} params
 * @param {string} params.to - Alamat email donatur
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program yang ditutup
 * @param {string} params.catalogUrl - Tautan ke katalog program aktif
 */
export async function sendRoutineCompletionEmail({
  to,
  donorName,
  programTitle,
  catalogUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = `Pemberitahuan Penutupan Program: ${programTitle} - Yayasan PABE`;
  const html = buildRoutineCompletionEmailHtml({
    donorName,
    programTitle,
    catalogUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Mengirimkan email pemberitahuan pengalihan otomatis program donasi rutin
 * @param {object} params
 * @param {string} params.to - Alamat email donatur
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.oldProgramTitle - Judul program lama yang selesai
 * @param {string} params.newProgramTitle - Judul program baru tujuan pengalihan
 * @param {string} params.actionUrl - Tautan ke rincian program / dashboard donatur
 */
export async function sendRoutineRolloverEmail({
  to,
  donorName,
  oldProgramTitle,
  newProgramTitle,
  actionUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = `Pemberitahuan Pengalihan Program Donasi Rutin: ${newProgramTitle} - Yayasan PABE`;
  const html = buildRoutineRolloverEmailHtml({
    donorName,
    oldProgramTitle,
    newProgramTitle,
    actionUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Mengirimkan email pemberitahuan jeda otomatis jadwal donasi rutin karena 3 tagihan berturut-turut belum dibayar
 * @param {object} params
 * @param {string} params.to - Alamat email donatur
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {string} params.resumeUrl - Tautan untuk mengaktifkan kembali jadwal di dashboard
 */
export async function sendRoutinePausedDueToUnpaidEmail({
  to,
  donorName,
  programTitle,
  resumeUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = `Pemberitahuan Penjeda'an Jadwal Donasi Rutin: ${programTitle} - Yayasan PABE`;
  const html = buildRoutinePausedDueToUnpaidEmailHtml({
    donorName,
    programTitle,
    resumeUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Mengirimkan email bukti donasi digital resmi kepada donatur setelah pelunasan
 * @param {object} params
 * @param {string} params.to - Alamat email donatur
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {number} params.amount - Nominal donasi
 * @param {string} params.invoiceId - Nomor invoice
 * @param {Date|string} [params.paidAt] - Waktu pembayaran
 * @param {string} [params.paymentChannelName] - Nama metode pembayaran
 * @param {string} [params.prayer] - Doa donatur
 * @param {string} params.actionUrl - Tautan melihat kuitansi digital
 */
export async function sendDonationReceiptEmail({
  to,
  donorName,
  programTitle,
  amount,
  invoiceId,
  paidAt,
  paymentChannelName,
  prayer,
  actionUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = getDonationReceiptEmailSubject(programTitle, invoiceId);
  const html = buildDonationReceiptEmailHtml({
    donorName,
    programTitle,
    amount,
    invoiceId,
    paidAt,
    paymentChannelName,
    prayer,
    actionUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}




/**
 * Mengirim email tanda terima berkas pendaftaran relawan baru
 */
export async function sendVolunteerRegistrationEmail({
  to,
  name,
  city,
  interest,
  statusUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const html = buildVolunteerRegistrationEmailHtml({
    name,
    city,
    interest,
    statusUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject: VOLUNTEER_REGISTRATION_EMAIL_SUBJECT,
    html,
  });
}

/**
 * Mengirim email pemberitahuan pendaftaran relawan yang telah disetujui resmi
 */
export async function sendVolunteerApprovedEmail({
  to,
  name,
  volunteerId,
  validationUrl,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const html = buildVolunteerApprovalEmailHtml({
    name,
    volunteerId,
    validationUrl,
    logoUrl,
  });

  return sendEmail({
    to,
    subject: VOLUNTEER_APPROVAL_EMAIL_SUBJECT,
    html,
  });
}

/**
 * Mengirim email tanda terima berkas lamaran kerja pelamar
 */
export async function sendCareerApplicationEmail({
  to,
  name,
  position,
  department,
}) {
  const logoUrl = await getPublicEmailLogoUrl();
  const subject = getCareerApplicationEmailSubject(position);
  const html = buildCareerApplicationEmailHtml({
    name,
    position,
    department,
    logoUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
  });
}
