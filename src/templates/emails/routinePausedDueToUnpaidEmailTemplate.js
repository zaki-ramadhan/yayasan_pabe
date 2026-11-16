import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailCtaButton, EMAIL_FONT_STACK } from "./emailComponents";

/**
 * Membuat konten HTML email pemberitahuan jeda otomatis jadwal donasi rutin
 * karena adanya 3 tagihan berturut-turut yang kedaluwarsa tanpa pelunasan.
 *
 * @param {object} params
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {string} params.resumeUrl - Tautan untuk mengaktifkan kembali jadwal di dashboard
 * @param {string} [params.logoUrl] - URL logo publik
 * @returns {string} Markup HTML email lengkap
 */
export function buildRoutinePausedDueToUnpaidEmailHtml({
  donorName,
  programTitle,
  resumeUrl,
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";

  const buttonHtml = buildEmailCtaButton({
    text: "Kelola & Aktifkan Kembali Jadwal",
    url: resumeUrl,
    variant: "primary3d",
    showFallbackUrl: true,
  });

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading("Jadwal Donasi Dijeda Sementara")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Isi Pesan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jadwal donasi rutin Anda untuk program <strong>${programTitle}</strong> kami jeda sementara karena terdapat 3 tagihan sebelumnya yang belum terselesaikan. Selama masa jeda, sistem tidak akan menerbitkan penagihan baru.
    </p>

    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Anda dapat mengaktifkan kembali atau memperbarui jadwal donasi kapan saja melalui menu <a href="${resumeUrl}">Dashboard Donatur</a> atau tombol di bawah ini:
    </p>

    <!-- Tombol Aksi -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Jazakumullah khairan katsiran atas niat tulus dan kebaikan yang senantiasa Anda titipkan melalui Yayasan Payung Berkah.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Penjeda'an Jadwal Donasi Rutin: ${programTitle}`,
    contentHtml,
    logoUrl,
  });
}

