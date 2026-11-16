import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailCtaButton, EMAIL_FONT_STACK } from "./emailComponents";

export const PASSWORD_RESET_EMAIL_SUBJECT = "Atur Ulang Kata Sandi Akun - Yayasan PABE";

/**
 * Membuat konten HTML email reset kata sandi donatur (SRP & Modular)
 * @param {object} params
 * @param {string} params.name - Nama pengguna
 * @param {string} params.resetUrl - Tautan reset kata sandi lengkap
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildPasswordResetEmailHtml({ name, resetUrl, logoUrl }) {
  const safeName = name ? name.trim() : "Sahabat Kebaikan";

  const buttonHtml = buildEmailCtaButton({
    text: "Atur Ulang Kata Sandi",
    url: resetUrl,
    variant: "primary3d",
    showFallbackUrl: true,
    confidentialityNotice: "Penting: Tautan ini berlaku selama 30 menit. Demi menjaga kerahasiaan kata sandi, jangan bagikan tautan ini kepada pihak lain.",
  });

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Atur Ulang Kata Sandi")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>
    
    <!-- Isi Pesan -->
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Kami menerima permintaan pengaturan ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:
    </p>

    <!-- Tombol Aksi Utama -->
    ${buttonHtml}

    <!-- Catatan Bantuan & Keamanan -->
    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jika Anda tidak merasa mengajukan permintaan ini, akun Anda tetap aman dan Anda dapat mengabaikan email ini.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Atur Ulang Kata Sandi - Yayasan PABE",
    contentHtml,
    logoUrl,
  });
}
