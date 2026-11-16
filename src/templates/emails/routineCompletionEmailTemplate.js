import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailCtaButton, EMAIL_FONT_STACK } from "./emailComponents";

/**
 * Membuat konten HTML email pemberitahuan penutupan program donasi rutin
 * @param {object} params
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program yang ditutup
 * @param {string} params.catalogUrl - Tautan ke katalog program aktif
 * @param {string} [params.logoUrl] - URL logo publik
 * @returns {string} Markup HTML email lengkap
 */
export function buildRoutineCompletionEmailHtml({
  donorName,
  programTitle,
  catalogUrl,
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";

  const buttonHtml = buildEmailCtaButton({
    text: "Jelajahi Program Donasi Lainnya",
    url: catalogUrl,
    variant: "primary3d",
    showFallbackUrl: true,
  });

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Program Donasi Telah Selesai")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Isi Pesan -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Alhamdulillah, program donasi <strong>${programTitle}</strong> kini telah resmi selesai dan target penyalurannya telah tuntas dengan baik.
    </p>

    <!-- Penjelasan Status Jadwal (Clean Text Paragraph) -->
    <p style="margin: 0 0 18px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Sehubungan dengan penutupan program tersebut, komitmen donasi rutin Anda dihentikan secara otomatis dan tidak ada tagihan lanjutan.
    </p>

    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jazakumullah khairan katsiran atas keistiqomahan Anda. Semoga setiap donasi yang telah ditunaikan menjadi amal jariyah yang senantiasa mengalirkan pahala bagi Anda dan keluarga.
    </p>

    <!-- Tombol Aksi (Centered 3D) -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Pemberitahuan ini dikirimkan otomatis oleh sistem Yayasan Payung Berkah sebagai bentuk transparansi dan tanggung jawab amanah program.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Penutupan Program: ${programTitle}`,
    contentHtml,
    logoUrl,
  });
}
