import { buildBaseEmailHtml } from "./baseEmailTemplate";
import {
  buildEmailHeading,
  buildEmailCtaButton,
  buildEmailKeyValueTable,
  EMAIL_FONT_STACK,
} from "./emailComponents";

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
  interest = "Anggota",
  statusUrl = "",
  logoUrl,
}) {
  const safeName = name ? name.trim() : "Sahabat Relawan";
  const safeCity = city ? city.trim() : "-";
  const safeInterest = interest ? interest.trim() : "Anggota";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org").replace(/\/+$/, "");
  const targetUrl = statusUrl || `${appUrl}/relawan`;

  const buttonHtml = buildEmailCtaButton({
    text: "Pantau Status Relawan",
    url: targetUrl,
    variant: "primary3d",
    showFallbackUrl: true,
  });

  const regItems = [
    { label: "Nama Relawan", value: `<span style="text-transform: uppercase;">${safeName}</span>` },
    { label: "Kota Domisili", value: safeCity },
    { label: "Fokus Peminatan", value: safeInterest },
    { label: "Status Pengajuan", value: "Sedang Ditinjau Tim (PENDING)", isHighlight: true },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Pendaftaran Relawan Diterima")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Pengantar -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Terima kasih atas niat mulia Anda bergabung sebagai <strong>Relawan</strong> Yayasan Payung Berkah. Berkas pendaftaran Anda telah kami terima:
    </p>

    <!-- Rincian Pendaftaran (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(regItems)}

    <!-- Tombol CTA (Centered 3D) -->
    ${buttonHtml}

    <!-- Catatan Lanjutan -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Tim pengurus kami sedang meninjau berkas pendaftaran Anda. Pemberitahuan hasil verifikasi beserta akses kartu digital akan dikirimkan ke email ini setelah proses penelaahan selesai.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Pendaftaran Relawan Diterima - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}
