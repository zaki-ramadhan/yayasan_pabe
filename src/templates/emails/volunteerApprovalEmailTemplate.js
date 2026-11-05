import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

export const VOLUNTEER_APPROVAL_EMAIL_SUBJECT =
  "Selamat! Pendaftaran Relawan Anda Telah Disetujui - Yayasan Payung Berkah";

/**
 * Membuat konten HTML email pemberitahuan pendaftaran relawan yang telah disetujui admin
 * @param {object} params
 * @param {string} params.name - Nama relawan
 * @param {string} params.volunteerId - Kode identitas resmi relawan (contoh: YPABE-202611-001)
 * @param {string} params.validationUrl - Tautan halaman validasi/kartu tanda anggota relawan
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
    text: "Buka Kartu Anggota Resmi",
    url: validationUrl,
    variant: "primary3d",
  });

  const contentHtml = `
    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Berita Utama -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Alhamdulillah, pendaftaran Anda untuk bergabung menjadi bagian dari <strong>Relawan Kebaikan</strong> Yayasan Payung Berkah telah <strong>disetujui</strong> oleh tim pengurus yayasan.
    </p>

    <!-- Kotak Sertifikasi & Nomor Anggota -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 18px 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #166534; width: 140px;">Nomor ID Relawan</td>
        <td style="padding: 6px 0; font-size: 14px; color: #15803d; font-weight: 700;">: #${safeId}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #166534;">Status Keanggotaan</td>
        <td style="padding: 6px 0; font-size: 13px; color: #15803d; font-weight: 600;">: RESMI TERVERIFIKASI</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #166534;">Masa Berlaku</td>
        <td style="padding: 6px 0; font-size: 13px; color: #15803d; font-weight: 600;">: 1 Tahun (Dapat Diperpanjang)</td>
      </tr>
    </table>

    <p style="margin: 0 0 28px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Kartu tanda anggota (KTA) digital resmi Anda telah aktif. Anda dapat melihat kartu interaktif 3D Lanyard, mengunduh, atau mencetak kartu identitas relawan Anda melalui tautan di bawah ini:
    </p>

    <!-- Tombol CTA -->
    ${buttonHtml}

    <!-- Catatan Penutup -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Gunakan kartu identitas resmi ini dalam setiap kegiatan aksi sosial, distribusi bantuan mustahik, dan agenda lapangan Yayasan Payung Berkah. Semoga langkah kebaikan ini membawa keberkahan bagi umat.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Selamat! Pendaftaran Relawan Disetujui - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}
