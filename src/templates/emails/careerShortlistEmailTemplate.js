import { buildBaseEmailHtml } from "./baseEmailTemplate";

/**
 * Membuat subjek email lolos seleksi berkas karier
 * @param {string} position
 * @returns {string}
 */
export function getCareerShortlistEmailSubject(position) {
  return `Kabar Baik: Seleksi Berkas Lamaran ${position ? position.trim() : "Karier"} - Yayasan Payung Berkah`;
}

/**
 * Membuat konten HTML email pemberitahuan pelamar lolos seleksi berkas (SHORTLISTED)
 * @param {object} params
 * @param {string} params.name - Nama lengkap pelamar
 * @param {string} params.position - Posisi lowongan kerja yang dilamar
 * @param {string} [params.department] - Divisi / departemen posisi
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildCareerShortlistEmailHtml({
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

    <!-- Kabar Baik -->
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Alhamdulillah, kami memiliki kabar baik terkait berkas lamaran kerja yang Anda ajukan untuk posisi <strong>${safePosition}</strong> di <strong>Yayasan Payung Berkah</strong>.
    </p>

    <!-- Kotak Rincian Status Lolos Seleksi -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px 20px;">
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #166534; width: 140px;">Nama Pelamar</td>
        <td style="padding: 5px 0; font-size: 13px; color: #15803d; font-weight: 600;">: ${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #166534;">Posisi Dilamar</td>
        <td style="padding: 5px 0; font-size: 13px; color: #15803d; font-weight: 600;">: ${safePosition}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #166534;">Departemen</td>
        <td style="padding: 5px 0; font-size: 13px; color: #15803d; font-weight: 600;">: ${safeDept}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #166534;">Status Seleksi</td>
        <td style="padding: 5px 0; font-size: 13px; color: #15803d; font-weight: 700;">: LOLOS PENAPISAN AWAL (SHORTLISTED)</td>
      </tr>
    </table>

    <!-- Langkah Selanjutnya -->
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Setelah melalui evaluasi dokumen dan portofolio, tim Human Capital kami mengapresiasi keselarasan latar belakang Anda dengan kriteria yang dibutuhkan. Anda dinyatakan berhak mengikuti <strong>tahapan seleksi berikutnya (wawancara kerja)</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Tim rekrutmen kami akan segera menghubungi Anda melalui nomor WhatsApp atau telepon resmi yayasan dalam beberapa hari kerja ke depan untuk mengonfirmasi jadwal dan teknis sesi wawancara. Mohon pastikan kontak Anda selalu dapat dihubungi.
    </p>

    <!-- Catatan Keamanan Rekrutmen -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Seluruh rangkaian rekrutmen dan seleksi di Yayasan Payung Berkah tidak dipungut biaya apa pun. Tetap waspada terhadap segala bentuk penipuan yang mengatasnamakan yayasan kami.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Lolos Seleksi Berkas: ${safePosition} - Yayasan Payung Berkah`,
    contentHtml,
    logoUrl,
  });
}

