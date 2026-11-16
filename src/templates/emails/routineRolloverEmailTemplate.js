import { buildBaseEmailHtml } from "./baseEmailTemplate";
import {
  buildEmailHeading,
  buildEmailCtaButton,
  buildEmailKeyValueTable,
  EMAIL_FONT_STACK,
} from "./emailComponents";

/**
 * Membuat konten HTML email pemberitahuan pengalihan otomatis program donasi rutin
 * saat program sebelumnya telah selesai/ditutup.
 *
 * @param {object} params
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.oldProgramTitle - Judul program yang telah selesai
 * @param {string} params.newProgramTitle - Judul program baru yang dialihkan
 * @param {string} params.actionUrl - Tautan ke rincian program baru / dashboard donatur
 * @param {string} [params.logoUrl] - URL logo publik
 * @returns {string} Markup HTML email lengkap
 */
export function buildRoutineRolloverEmailHtml({
  donorName,
  oldProgramTitle,
  newProgramTitle,
  actionUrl,
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";

  const buttonHtml = buildEmailCtaButton({
    text: "Lihat Program & Kelola Jadwal",
    url: actionUrl,
    variant: "primary3d",
    showFallbackUrl: true,
  });

  const rolloverItems = [
    { label: "Program Sebelumnya", value: `${oldProgramTitle} (Selesai)` },
    { label: "Dialihkan ke Program", value: newProgramTitle, isHighlight: true },
  ];

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Pengalihan Program Donasi Rutin")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Isi Pesan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Program donasi <strong>${oldProgramTitle}</strong> telah selesai dan target penyalurannya telah terpenuhi. Agar kesinambungan sedekah rutin Anda terus berjalan tanpa terputus, komitmen kebaikan Anda dialihkan ke program aktif berikut:
    </p>

    <!-- Rincian Pengalihan (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(rolloverItems)}

    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Nominal dan jadwal rutin Anda tetap sama seperti sebelumnya. Anda dapat mengubah pilihan program atau menjeda jadwal kapan saja melalui menu <a href="${actionUrl}">Dashboard Donatur</a>.
    </p>

    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jazakumullah khairan katsiran atas keistiqomahan Anda. Semoga Allah SWT senantiasa memberkahi rezeki dan keluarga Anda. Aamiin ya Rabbal 'Alamin.
    </p>

    <!-- Tombol Aksi -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Pemberitahuan ini dikirimkan otomatis oleh Yayasan Payung Berkah sebagai bentuk transparansi dan tanggung jawab amanah program.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pengalihan Program Donasi Rutin: ${newProgramTitle}`,
    contentHtml,
    logoUrl,
  });
}

