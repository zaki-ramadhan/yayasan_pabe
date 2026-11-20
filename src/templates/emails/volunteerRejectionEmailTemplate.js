import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailKeyValueTable, EMAIL_FONT_STACK } from "./emailComponents";

export const VOLUNTEER_REJECTION_EMAIL_SUBJECT =
  "Informasi Pendaftaran Relawan - Yayasan Payung Berkah";

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

  const rejectionItems = [
    { label: "Status Pengajuan", value: "Ditolak" },
    { label: "Keterangan", value: "Kuota relawan untuk periode kegiatan saat ini telah terpenuhi" },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Pemberitahuan Pendaftaran Relawan")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Apresiasi Niat Baik -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Terima kasih atas niat mulia dan ketulusan hati Anda untuk bergabung sebagai Relawan Yayasan Payung Berkah${interestText}:
    </p>

    <!-- Penjelasan Santun (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(rejectionItems)}

    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Setelah peninjauan kapasitas kegiatan lapangan, saat ini kami belum dapat menyetujui pendaftaran Anda untuk periode ini.
    </p>

    <!-- Informasi Silaturahmi & Jejaring Relawan -->
    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Meskipun demikian, data dan kontak Anda tetap tersimpan dalam pangkalan data relawan yayasan. Kami akan menghubungi Anda kembali apabila ada agenda sosial baru yang membutuhkan peran relawan di kemudian hari.
    </p>

    <!-- Catatan Doa & Penutup -->
    <p style="margin: 20px 0 0 0; font-size: 15px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Semoga Allah SWT senantiasa memberkahi niat tulus Anda dan memudahkan segala langkah kebaikan kita bersama.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: "Informasi Pendaftaran Relawan - Yayasan Payung Berkah",
    contentHtml,
    logoUrl,
  });
}

