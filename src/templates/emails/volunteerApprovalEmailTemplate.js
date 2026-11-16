import { buildBaseEmailHtml } from "./baseEmailTemplate";
import {
  buildEmailHeading,
  buildEmailCtaButton,
  buildEmailKeyValueTable,
  EMAIL_FONT_STACK,
} from "./emailComponents";

export const VOLUNTEER_APPROVAL_EMAIL_SUBJECT =
  "Selamat! Pendaftaran Relawan Anda Telah Disetujui - Yayasan Payung Berkah";

/**
 * Membuat konten HTML email pemberitahuan pendaftaran relawan yang telah disetujui admin
 * @param {object} params
 * @param {string} params.name - Nama relawan
 * @param {string} params.volunteerId - Kode identitas resmi relawan (contoh: YPABE-202611-001)
 * @param {string} params.validationUrl - Tautan halaman validasi/kartu relawan
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildVolunteerApprovalEmailHtml({
  name,
  volunteerId,
  validationUrl,
  logoUrl,
}) {
  const safeName = name ? name.trim() : "Sahabat Relawan";
  const safeId = volunteerId || "YPABE-VOLUNTEER";

  const buttonHtml = buildEmailCtaButton({
    text: "Buka Kartu Relawan Digital",
    url: validationUrl,
    variant: "primary3d",
    showFallbackUrl: true,
    confidentialityNotice: "Catatan: Kartu identitas relawan digital ini memuat identitas resmi Anda. Jangan bagikan tautan ini kepada pihak yang tidak berwenang.",
  });

  const approvalItems = [
    { label: "Nomor ID Relawan", value: `#${safeId}`, isHighlight: true },
    { label: "Status Keanggotaan", value: "RESMI TERVERIFIKASI" },
    { label: "Masa Berlaku", value: "1 Tahun (Aktif)" },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Pendaftaran Relawan Disetujui")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Berita Utama -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Alhamdulillah, pendaftaran Anda sebagai <strong>Relawan</strong> Yayasan Payung Berkah telah disetujui:
    </p>

    <!-- Rincian Sertifikasi (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(approvalItems)}

    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Kartu identitas relawan digital Anda kini telah aktif dan dapat diakses melalui tautan di bawah ini:
    </p>

    <!-- Tombol CTA (Centered 3D) -->
    ${buttonHtml}

    <!-- Catatan Penutup -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Gunakan kartu identitas ini saat bertugas di agenda lapangan yayasan. Jazakumullah khairan katsiran atas dedikasi dan kesediaan Anda berbagi manfaat bagi sesama.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Selamat! Pendaftaran Relawan Disetujui - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}
