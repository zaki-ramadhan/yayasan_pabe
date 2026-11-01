import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

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
  const safeName = name ? name.trim() : "Bapak/Ibu Donatur";

  const buttonHtml = buildEmailCtaButton({
    text: "Aktifkan Akun Saya",
    url: activationUrl,
    variant: "primary3d",
  });

  const contentHtml = `
    <!-- Sapaan (Gaya Sambutan Asli) -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>
    
    <!-- Isi Pesan (Jarak 32px ke Tombol) -->
    <p style="margin: 0 0 32px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Terima kasih telah mendaftar di <strong>Yayasan Payung Berkah</strong>. Untuk memastikan keamanan akun dan keabsahan alamat email Anda, silakan aktifkan akun Anda melalui tombol di bawah ini:
    </p>

    <!-- Tombol Aksi Utama (Gaya CTA 3D Blue - Jarak Bawah 36px) -->
    ${buttonHtml}

    <!-- Catatan Bantuan & Keamanan (Teks Hitam Tegas, Kontras Maksimal) -->
    <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Tautan aktivasi ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar di Yayasan Payung Berkah, silakan abaikan email ini dengan aman.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Aktivasi Akun - Yayasan PABE",
    contentHtml,
    logoUrl,
  });
}
