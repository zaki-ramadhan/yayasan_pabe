import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";

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
    text: "Jelajahi Program Kebaikan Lainnya",
    url: catalogUrl,
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
      Alhamdulillah, atas izin Allah SWT dan dukungan tulus dari para donatur, program kebaikan <strong>${programTitle}</strong> kini telah resmi selesai dan target penyalurannya telah terpenuhi dengan baik.
    </p>

    <!-- Kotak Pengumuman Status Jadwal -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; border-collapse: separate;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #065f46;">
            Komitmen Donasi Rutin Selesai Secara Otomatis
          </p>
          <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
            Sehubungan dengan penutupan program ini, jadwal komitmen donasi rutin Anda telah dihentikan secara otomatis. Sistem tidak akan lagi menerbitkan tagihan lanjutan untuk program ini.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Jazakumullah Khairan Katsiran atas keistiqomahan Anda dalam menemani program ini hingga tuntas. Semoga setiap rupiah yang telah disalurkan menjadi amal jariyah yang terus mengalirkan pahala kebaikan.
    </p>

    <!-- Tombol Aksi -->
    ${buttonHtml}

    <!-- Footer Catatan -->
    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      Pesan ini dikirimkan otomatis oleh sistem Yayasan Payung Berkah sebagai bentuk transparansi dan tanggung jawab amanah program.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Pemberitahuan Penutupan Program: ${programTitle}`,
    contentHtml,
    logoUrl,
  });
}
