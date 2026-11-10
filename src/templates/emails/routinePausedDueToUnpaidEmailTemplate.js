import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

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
  });

  const contentHtml = `
    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Assalamu’alaikum Warahmatullahi Wabarakatuh,<br />
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Isi Pesan -->
    <p style="margin: 0 0 18px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Semoga Anda dan keluarga senantiasa berada dalam lindungan dan limpahan rahmat Allah SWT.
    </p>

    <!-- Kotak Pengumuman Status Jadwal Dijeda -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; border-collapse: separate;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #92400e;">
            Jadwal Donasi Rutin Dijeda Sementara
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #b45309; line-height: 1.5;">
            Demi kenyamanan Anda, jadwal komitmen donasi rutin untuk program <strong>${programTitle}</strong> kami jeda secara otomatis karena terdapat 3 tagihan sebelumnya yang belum sempat terselesaikan.
          </p>
          <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.4;">
            Selama jadwal dalam status jeda, sistem kami tidak akan mengirimkan invoice atau penagihan baru ke email Anda.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Kami sangat memahami kesibukan Bapak/Ibu. Apabila Anda ingin mengaktifkan kembali komitmen kebaikan ini atau menyesuaikan nominal dan jadwal donasi baru, Anda dapat mengaturnya dengan mudah kapan saja melalui Dashboard Donatur:
    </p>

    <!-- Tombol Aksi -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      Jazakumullah Khairan Katsiran atas segala kebaikan dan niat tulus yang senantiasa Anda titipkan melalui Yayasan Payung Berkah.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Penjeda'an Jadwal Donasi Rutin: ${programTitle}`,
    contentHtml,
    logoUrl,
  });
}

