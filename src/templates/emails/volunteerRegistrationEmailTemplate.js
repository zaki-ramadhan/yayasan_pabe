import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

export const VOLUNTEER_REGISTRATION_EMAIL_SUBJECT =
  "Pendaftaran Relawan Diterima - Yayasan Payung Berkah";

/**
 * Membuat konten HTML email konfirmasi pendaftaran relawan baru
 * @param {object} params
 * @param {string} params.name - Nama pendaftar relawan
 * @param {string} params.city - Kota domisili
 * @param {string} params.interest - Fokus peminatan relawan
 * @param {string} [params.statusUrl] - Tautan pemeriksaan status pendaftaran
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildVolunteerRegistrationEmailHtml({
  name,
  city = "-",
  interest = "Relawan Kebaikan",
  statusUrl = "",
  logoUrl,
}) {
  const safeName = name ? name.trim() : "Sahabat Relawan";
  const safeCity = city ? city.trim() : "-";
  const safeInterest = interest ? interest.trim() : "Relawan Kebaikan";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org").replace(/\/+$/, "");
  const targetUrl = statusUrl || `${appUrl}/volunteer`;

  const buttonHtml = buildEmailCtaButton({
    text: "Pantau Status Relawan",
    url: targetUrl,
    variant: "primary3d",
  });

  const contentHtml = `
    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Pengantar -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Terima kasih atas niat mulia dan kesediaan Anda menjadi bagian dari <strong>Relawan Kebaikan</strong> Yayasan Payung Berkah. Berkas pendaftaran Anda telah berhasil kami terima dalam sistem.
    </p>

    <!-- Ringkasan Rincian Pendaftaran -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563; width: 140px;">Nama Relawan</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Kota Domisili</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeCity}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Fokus Peminatan</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeInterest}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Status Pengajuan</td>
        <td style="padding: 6px 0; font-size: 13px; color: #b45309; font-weight: 600;">: Sedang Ditinjau Tim (PENDING)</td>
      </tr>
    </table>

    <!-- Tombol CTA -->
    ${buttonHtml}

    <!-- Catatan Lanjutan -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Tim pengelola program yayasan akan meninjau berkas pendaftaran Anda. Setelah disetujui, Anda akan menerima email notifikasi resmi beserta akses ke kartu anggota relawan digital.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Pendaftaran Relawan Diterima - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}
