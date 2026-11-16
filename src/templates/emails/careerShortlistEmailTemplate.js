import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailKeyValueTable, EMAIL_FONT_STACK } from "./emailComponents";

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

  const shortlistItems = [
    { label: "Nama Pelamar", value: `<span style="text-transform: uppercase;">${safeName}</span>` },
    { label: "Posisi Dilamar", value: safePosition },
    { label: "Departemen", value: safeDept },
    { label: "Status Seleksi", value: "Lolos Seleksi Berkas (SHORTLISTED)", isHighlight: true },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Kabar Baik: Seleksi Berkas Lamaran")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Kabar Baik -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Alhamdulillah, berkas lamaran kerja yang Anda ajukan untuk posisi <strong>${safePosition}</strong> telah selesai kami tinjau:
    </p>

    <!-- Rincian Status (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(shortlistItems)}

    <!-- Langkah Selanjutnya -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Profil dan pengalaman Anda dinilai selaras dengan kriteria posisi ini. Anda berhak mengikuti tahapan seleksi berikutnya (<strong>wawancara kerja</strong>).
    </p>

    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Tim rekrutmen kami akan segera menghubungi Anda dalam beberapa hari kerja ke depan untuk konfirmasi jadwal wawancara. Mohon pastikan kontak Anda selalu aktif.
    </p>

    <!-- Catatan Keamanan Rekrutmen -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Seluruh tahapan rekrutmen di Yayasan Payung Berkah bebas biaya. Waspada terhadap pihak yang mengatasnamakan yayasan dengan memungut biaya apa pun.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Lolos Seleksi Berkas: ${safePosition} - Yayasan Payung Berkah`,
    contentHtml,
    logoUrl,
  });
}

