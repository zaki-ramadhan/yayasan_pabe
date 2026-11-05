import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";
import { formatRupiah } from "@/lib/formatters";

/**
 * Menyusun subjek email bukti donasi digital resmi
 * @param {string} programTitle
 * @param {string} invoiceId
 * @returns {string}
 */
export function getDonationReceiptEmailSubject(programTitle, invoiceId) {
  return `Bukti Donasi Sah: ${programTitle || "Yayasan Payung Berkah"} [${invoiceId}]`;
}

/**
 * Menyusun konten HTML email tanda terima / kuitansi donasi digital
 * @param {object} params
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {number} params.amount - Nominal donasi
 * @param {string} params.invoiceId - Nomor invoice resmi
 * @param {Date|string} [params.paidAt] - Tanggal & waktu pelunasan
 * @param {string} [params.paymentChannelName] - Nama metode pembayaran
 * @param {string} [params.prayer] - Doa/titipan hajat donatur
 * @param {string} params.actionUrl - Tautan melihat invoice digital
 * @param {string} [params.logoUrl] - URL logo publik
 * @returns {string} Markup HTML email lengkap
 */
export function buildDonationReceiptEmailHtml({
  donorName,
  programTitle,
  amount,
  invoiceId,
  paidAt = new Date(),
  paymentChannelName = "Pembayaran Digital",
  prayer = "",
  actionUrl,
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";
  const dateObj = paidAt instanceof Date ? paidAt : new Date(paidAt);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const buttonHtml = buildEmailCtaButton({
    text: "Buka Bukti Donasi Digital",
    url: actionUrl,
    variant: "primary3d",
  });

  const contentHtml = `
    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.5;">
      Assalamu’alaikum Warahmatullahi Wabarakatuh,<br />
      Halo <strong>${safeName}</strong>,
    </p>

    <!-- Pembuka -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Alhamdulillah, pembayaran donasi Anda telah kami terima dan terverifikasi secara sah ke dalam rekening amanah kas Yayasan Payung Berkah:
    </p>

    <!-- Kotak Ringkasan Rincian Donasi -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: separate; overflow: hidden;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 4px;">
            Nomor Transaksi
          </span>
          <span style="font-size: 14px; font-family: monospace; font-weight: 700; color: #0f172a;">
            ${invoiceId}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 4px;">
            Program Kebaikan
          </span>
          <span style="font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.4;">
            ${programTitle || "Donasi Kebaikan"}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f0fdf4;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; display: block; margin-bottom: 4px;">
            Nominal Donasi Terverifikasi
          </span>
          <span style="font-size: 20px; font-weight: 700; color: #15803d; letter-spacing: -0.01em;">
            ${formatRupiah(amount)}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Waktu Pembayaran</span>
          <span style="font-size: 13px; font-weight: 500; color: #1e293b;">${formattedDate} WIB</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 20px; border-bottom: ${prayer ? "1px solid #e2e8f0" : "none"};">
          <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Metode Pembayaran</span>
          <span style="font-size: 13px; font-weight: 500; color: #1e293b;">${paymentChannelName}</span>
        </td>
      </tr>
      ${
        prayer
          ? `
      <tr>
        <td style="padding: 14px 20px; background-color: #fefce8;">
          <span style="font-size: 12px; font-weight: 600; color: #854d0e; display: block; margin-bottom: 4px;">Doa & Harapan Donatur</span>
          <span style="font-size: 13px; font-style: italic; color: #713f12; line-height: 1.5;">"${prayer}"</span>
        </td>
      </tr>
      `
          : ""
      }
    </table>

    <!-- Call to Action Button -->
    ${buttonHtml}

    <!-- Penutup & Doa -->
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      Jazakumullah khairan katsiran atas sedekah dan kepercayaan Anda. Semoga Allah SWT menerima amal ibadah Anda, menggantinya dengan rezeki yang berkah dan melimpah, serta memberikan ketenangan lahir dan batin untuk Anda sekeluarga. Aamiin ya Rabbal 'Alamin.
    </p>

    <!-- Tanda Tangan -->
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
      <tr>
        <td>
          <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
            Salam hangat dan doa,<br />
            <strong style="color: #111827;">Tim Pengurus Yayasan Payung Berkah</strong><br />
            <span style="font-size: 12px; color: #6b7280;">Amanah, Transparan, dan Akuntabel</span>
          </p>
        </td>
      </tr>
    </table>
  `.trim();

  return buildBaseEmailHtml({
    title: `Bukti Donasi Sah: ${programTitle} [${invoiceId}]`,
    contentHtml,
    logoUrl,
  });
}
