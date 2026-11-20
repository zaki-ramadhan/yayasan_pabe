import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailKeyValueTable, EMAIL_FONT_STACK } from "./emailComponents";

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

  const applicationItems = [
    { label: "Nama Pelamar", value: `<span style="text-transform: uppercase;">${safeName}</span>` },
    { label: "Posisi Dilamar", value: safePosition },
    { label: "Departemen", value: safeDept },
    { label: "Status Berkas", value: "Menunggu Peninjauan (REVIEWING)", isHighlight: true },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Berkas Lamaran Diterima")}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Pengantar -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Terima kasih atas ketertarikan Anda untuk berkarier bersama <strong>Yayasan Payung Berkah</strong>. Berkas lamaran Anda telah berhasil kami terima dengan rincian pengajuan:
    </p>

    <!-- Rincian Lamaran (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(applicationItems)}

    <!-- Penjelasan Alur Seleksi -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Tim rekrutmen kami sedang menelaah profil dan kesesuaian berkas Anda. Kandidat yang terpilih akan kami hubungi secara langsung untuk tahapan wawancara selanjutnya.
    </p>

    <!-- Catatan Penutup -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Perhatian: Seluruh tahapan rekrutmen di Yayasan Payung Berkah bebas biaya. Waspada terhadap pihak yang mengatasnamakan yayasan dengan memungut biaya apa pun.
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
