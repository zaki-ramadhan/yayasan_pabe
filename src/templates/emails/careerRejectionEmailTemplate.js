import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailKeyValueTable, EMAIL_FONT_STACK } from "./emailComponents";

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

  const rejectionItems = [
    { label: "Nama Pelamar", value: `<span style="text-transform: uppercase;">${safeName}</span>` },
    { label: "Posisi Dilamar", value: safePosition },
    { label: "Departemen", value: safeDept },
    { label: "Status Lamaran", value: "Proses Seleksi Selesai" },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Pembaruan Status Lamaran Kerja")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Apresiasi Minat & Waktu Pelamar -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Terima kasih atas minat dan berkas lamaran kerja yang telah Anda ajukan untuk posisi <strong>${safePosition}</strong> di Yayasan Payung Berkah:
    </p>

    <!-- Rincian Lamaran (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(rejectionItems)}

    <!-- Penjelasan Santun & Objektif -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Setelah peninjauan berkas, saat ini kami memutuskan untuk melanjutkan proses dengan kandidat lain yang kualifikasinya lebih selaras dengan kebutuhan formasi yang sedang dibuka.
    </p>

    <!-- Talent Pool -->
    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Profil dan resume Anda tetap tersimpan dalam <em>talent pool</em> kami. Kami akan menghubungi Anda kembali apabila di masa mendatang tersedia kesempatan yang sesuai dengan keahlian Anda.
    </p>

    <!-- Doa & Penutup -->
    <p style="margin: 20px 0 0 0; font-size: 15px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Kami mengapresiasi antusiasme Anda dan mendoakan kesuksesan dalam setiap ikhtiar perjalanan karier Anda ke depan.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Status Lamaran: ${safePosition} - Yayasan Payung Berkah`,
    contentHtml,
    logoUrl,
  });
}

