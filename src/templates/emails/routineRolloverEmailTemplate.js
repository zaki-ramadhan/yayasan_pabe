import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

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
  });

  const contentHtml = `
    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Assalamu’alaikum Warahmatullahi Wabarakatuh,<br />
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Isi Pesan -->
    <p style="margin: 0 0 18px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Alhamdulillah, atas izin Allah SWT dan keistiqomahan Anda, program kebaikan <strong>${oldProgramTitle}</strong> kini telah resmi selesai dan target penyalurannya telah terpenuhi dengan baik.
    </p>

    <!-- Kotak Pengumuman Pengalihan Jadwal -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; border-collapse: separate;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #15803d;">
            Komitmen Kebaikan Anda Dialihkan ke Program Aktif
          </p>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #166534; line-height: 1.5;">
            Agar aliran pahala sedekah rutin Anda terus terjaga tanpa terputus, komitmen donasi rutin Anda telah dialihkan secara otomatis ke program kebaikan:
          </p>
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #14532d;">
            📌 ${newProgramTitle}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Nominal dan jadwal rutin Anda tetap sama persis seperti sebelumnya. Apabila Anda ingin memilih program lain, menjeda, atau mengubah jadwal donasi, Anda dapat mengaturnya kapan saja melalui Dashboard Donatur.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Jazakumullah Khairan Katsiran atas kesetiaan Anda dalam menemani langkah dakwah dan sosial kami. Semoga Allah memberkahi rezeki dan keluarga Anda. Aamiin.
    </p>

    <!-- Tombol Aksi -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      Pemberitahuan ini dikirimkan secara otomatis oleh Yayasan Payung Berkah sebagai bentuk transparansi dan tanggung jawab amanah program.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pengalihan Program Donasi Rutin: ${newProgramTitle}`,
    contentHtml,
    logoUrl,
  });
}

