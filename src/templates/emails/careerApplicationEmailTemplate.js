import { buildBaseEmailHtml } from "./baseEmailTemplate";

/**
 * Membuat konten HTML email konfirmasi tanda terima berkas lamaran kerja
 * @param {object} params
 * @param {string} params.name - Nama lengkap pelamar
 * @param {string} params.position - Judul lowongan kerja yang dilamar
 * @param {string} [params.department] - Divisi / departemen posisi
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildCareerApplicationEmailHtml({
  name,
  position,
  department = "Yayasan Payung Berkah",
  logoUrl,
}) {
  const safeName = name ? name.trim() : "Sahabat Pencari Kerja";
  const safePosition = position ? position.trim() : "Posisi Profesional";
  const safeDept = department ? department.trim() : "Yayasan Payung Berkah";

  const contentHtml = `
    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Pengantar -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Terima kasih atas ketertarikan dan niat baik Anda untuk berkarier serta bertumbuh bersama <strong>Yayasan Payung Berkah</strong>. Berkas lamaran dan portofolio Anda telah berhasil masuk ke dalam pangkalan data tim Human Capital kami.
    </p>

    <!-- Kotak Rincian Pengajuan Lowongan -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563; width: 140px;">Nama Pelamar</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Posisi Dilamar</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safePosition}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Departemen</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeDept}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Status Berkas</td>
        <td style="padding: 6px 0; font-size: 13px; color: #2563eb; font-weight: 600;">: Berkas Diterima (REVIEWING)</td>
      </tr>
    </table>

    <!-- Penjelasan Alur Seleksi -->
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Tim rekrutmen kami akan meninjau keselarasan profil dan kompetensi Anda dengan kebutuhan organisasi. Pelamar yang lolos penapisan administrasi awal akan dihubungi lebih lanjut melalui WhatsApp atau email resmi yayasan untuk jadwal wawancara.
    </p>

    <!-- Catatan Penutup -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Harap berhati-hati terhadap segala bentuk penipuan yang mengatasnamakan Yayasan Payung Berkah. Seluruh proses rekrutmen kami bebas dari pungutan biaya apa pun.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Konfirmasi Lamaran Kerja: ${safePosition} - Yayasan Payung Berkah`,
    contentHtml,
    logoUrl,
  });
}

export function getCareerApplicationEmailSubject(position) {
  return `Konfirmasi Penerimaan Berkas Lamaran - ${position || "Karier"} | Yayasan Payung Berkah`;
}
