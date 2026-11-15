import { buildBaseEmailHtml } from "./baseEmailTemplate";

/**
 * Membuat subjek email penolakan berkas lamaran kerja
 * @param {string} position
 * @returns {string}
 */
export function getCareerRejectionEmailSubject(position) {
  return `Pembaruan Status Lamaran: ${position ? position.trim() : "Karier"} - Yayasan Payung Berkah`;
}

/**
 * Membuat konten HTML email pemberitahuan pelamar yang belum lolos seleksi karier (REJECTED)
 * @param {object} params
 * @param {string} params.name - Nama lengkap pelamar
 * @param {string} params.position - Posisi lowongan kerja yang dilamar
 * @param {string} [params.department] - Divisi / departemen posisi
 * @param {string} [params.logoUrl] - URL logo yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildCareerRejectionEmailHtml({
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

    <!-- Apresiasi Minat & Waktu Pelamar -->
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Terima kasih banyak atas waktu, ketertarikan, dan berkas lamaran kerja yang telah Anda ajukan untuk posisi <strong>${safePosition}</strong> di <strong>Yayasan Payung Berkah</strong>.
    </p>

    <!-- Kotak Rincian Lamaran -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px;">
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #4b5563; width: 140px;">Nama Pelamar</td>
        <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #4b5563;">Posisi Dilamar</td>
        <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safePosition}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #4b5563;">Departemen</td>
        <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">: ${safeDept}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #4b5563;">Status Lamaran</td>
        <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: 600;">: Proses Seleksi Selesai</td>
      </tr>
    </table>

    <!-- Penjelasan Santun & Objektif -->
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Setelah melalui peninjauan berkas yang menyeluruh, saat ini kami memutuskan untuk melanjutkan proses seleksi dengan kandidat lain yang kualifikasi dan pengalaman khususnya lebih selaras dengan kebutuhan formasi yang sedang dibuka.
    </p>

    <!-- Talent Pool -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #111827; line-height: 1.6;">
      Profil dan resume Anda tetap tersimpan dalam basis data <em>talent pool</em> tim Human Capital kami. Jika di kemudian hari tersedia kesempatan atau lowongan baru yang sesuai dengan keahlian Anda, kami akan dengan senang hati menghubungi Anda kembali.
    </p>

    <!-- Doa & Penutup -->
    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      Kami menghargai antusiasme Anda dan mendoakan kesuksesan dalam setiap ikhtiar dan langkah perjalanan karier profesional Anda ke depan.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Status Lamaran: ${safePosition} - Yayasan Payung Berkah`,
    contentHtml,
    logoUrl,
  });
}

