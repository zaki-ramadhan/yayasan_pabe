import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

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
  const safeName = name ? name.trim() : "Bapak/Ibu Donatur";

  const buttonHtml = buildEmailCtaButton({
    text: "Atur Ulang Kata Sandi",
    url: resetUrl,
    variant: "primary3d",
  });

  const contentHtml = `
    <!-- Sapaan (Gaya Sambutan Asli) -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>
    
    <!-- Isi Pesan (Jarak 32px ke Tombol) -->
    <p style="margin: 0 0 32px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:
    </p>

    <!-- Tombol Aksi Utama (Gaya CTA 3D Blue - Jarak Bawah 36px) -->
    ${buttonHtml}

    <!-- Catatan Bantuan & Keamanan (Teks Hitam Tegas, Kontras Maksimal) -->
    <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Tautan ini berlaku selama 30 menit. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dengan aman.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Atur Ulang Kata Sandi - Yayasan PABE",
    contentHtml,
    logoUrl,
  });
}
