import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailCtaButton, EMAIL_FONT_STACK } from "./emailComponents";

export const ACCOUNT_ACTIVATION_EMAIL_SUBJECT = "Aktivasi Akun Donatur Anda - Yayasan PABE";

/**
 * Membuat konten HTML email aktivasi akun donatur baru (SRP & Modular)
 * @param {object} params
 * @param {string} params.name - Nama pengguna pendaftar
 * @param {string} params.activationUrl - Tautan aktivasi akun lengkap
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildAccountActivationEmailHtml({ name, activationUrl, logoUrl }) {
  const safeName = name ? name.trim() : "Sahabat Kebaikan";

  const buttonHtml = buildEmailCtaButton({
    text: "Aktifkan Akun Saya",
    url: activationUrl,
    variant: "primary3d",
    showFallbackUrl: true,
    confidentialityNotice: "Penting: Tautan aktivasi ini berlaku selama 24 jam. Demi keamanan akun, jangan bagikan tautan ini kepada pihak lain.",
  });

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Aktivasi Akun Donatur")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>
    
    <!-- Isi Pesan -->
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Terima kasih telah mendaftar di <strong>Yayasan Payung Berkah</strong>. Untuk memverifikasi akun dan alamat email Anda, silakan aktifkan akun melalui tombol di bawah ini:
    </p>

    <!-- Tombol Aksi Utama -->
    ${buttonHtml}

    <!-- Catatan Bantuan & Keamanan -->
    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jika Anda tidak merasa mendaftar di Yayasan Payung Berkah, silakan abaikan email ini dengan aman.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Aktivasi Akun - Yayasan PABE",
    contentHtml,
    logoUrl,
  });
}
