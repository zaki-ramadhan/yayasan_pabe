import { buildBaseEmailHtml } from "./baseEmailTemplate";

export const VOLUNTEER_REJECTION_EMAIL_SUBJECT =
  "Informasi Pendaftaran Relawan Kebaikan - Yayasan Payung Berkah";

/**
 * Membuat konten HTML email pemberitahuan pendaftaran relawan yang belum dapat diterima
 * @param {object} params
 * @param {string} params.name - Nama relawan
 * @param {string} [params.interest] - Bidang minat relawan
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildVolunteerRejectionEmailHtml({
  name,
  interest,
  logoUrl,
}) {
  const safeName = name ? name.trim() : "Sahabat Relawan";
  const interestText = interest ? ` pada bidang <strong>${interest.trim()}</strong>` : "";

  const contentHtml = `
    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Apresiasi Niat Baik -->
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Terima kasih banyak atas niat mulia dan ketulusan hati Anda untuk bergabung sebagai Relawan Kebaikan Yayasan Payung Berkah${interestText}. Kami sangat menghargai waktu dan kesediaan Anda untuk berbagi manfaat bersama umat.
    </p>

    <!-- Penjelasan Santun -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px;">
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #4b5563; width: 140px;">Status Pengajuan</td>
        <td style="padding: 4px 0; font-size: 13px; color: #b45309; font-weight: 600;">: Belum Dapat Disetujui</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #4b5563;">Keterangan</td>
        <td style="padding: 4px 0; font-size: 13px; color: #374151; line-height: 1.5;">: Kuota relawan untuk periode kegiatan saat ini telah terpenuhi</td>
      </tr>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Setelah melalui pertimbangan kebutuhan operasional dan kapasitas program lapangan, saat ini kami belum dapat menyetujui pendaftaran Anda untuk periode ini.
    </p>

    <!-- Informasi Silaturahmi & Jejaring Relawan -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Meskipun demikian, data dan kontak Anda tetap tersimpan dalam pangkalan data relawan yayasan. Kami akan sangat senang menghubungi Anda kembali apabila terdapat agenda sosial, bakti masyarakat, atau program kebaikan baru yang sesuai dengan minat Anda di kemudian hari.
    </p>

    <!-- Catatan Doa & Penutup -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Semoga Allah SWT senantiasa memberkahi niat tulus Anda dan memudahkan segala urusan serta langkah kebaikan kita bersama.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Pemberitahuan Pendaftaran Relawan - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}

