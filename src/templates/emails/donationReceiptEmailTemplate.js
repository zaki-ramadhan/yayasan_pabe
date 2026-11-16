import { buildBaseEmailHtml } from "./baseEmailTemplate";
import {
  buildEmailHeading,
  buildEmailCtaButton,
  buildEmailKeyValueTable,
  formatPaymentChannelLabel,
  formatGreetingName,
  EMAIL_FONT_STACK,
} from "./emailComponents";
import { formatRupiah } from "@/lib/formatters";
import { getTransactionVocabulary } from "@/lib/zisFilter";

/**
 * Menyusun subjek email bukti transaksi resmi yang adaptif terhadap kategori (Zakat, Infaq, Sedekah, Wakaf, Donasi)
 * @param {string} programTitle
 * @param {string} invoiceId
 * @param {object} [options]
 * @returns {string}
 */
export function getDonationReceiptEmailSubject(programTitle, invoiceId, options = {}) {
  const vocab = getTransactionVocabulary({
    programTitle,
    ...options,
  });
  return `${vocab.subjectPrefix}: ${programTitle || "Yayasan Payung Berkah"} [${invoiceId}]`;
}

/**
 * Menyusun konten HTML email tanda terima / kuitansi transaksi digital kontekstual
 * @param {object} params
 * @param {string} params.donorName - Nama donatur / muzakki / munfiq
 * @param {string} params.programTitle - Judul program (misal: Zakat Maal, Sedekah Subuh, dsb)
 * @param {number} params.amount - Nominal transaksi
 * @param {string} params.invoiceId - Nomor invoice resmi
 * @param {Date|string} [params.paidAt] - Tanggal & waktu pelunasan
 * @param {string} [params.paymentChannelName] - Nama metode pembayaran
 * @param {string} [params.prayer] - Doa/titipan hajat donatur
 * @param {string} params.actionUrl - Tautan melihat invoice digital
 * @param {string} [params.logoUrl] - URL logo publik
 * @param {string} [params.donationType] - Tipe transaksi ("ZAKAT", "INFAQ", "SEDEKAH", "WAKAF", "CAMPAIGN")
 * @param {string} [params.categoryName] - Nama kategori program
 * @param {string} [params.categorySlug] - Slug kategori program
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
  donationType,
  categoryName,
  categorySlug,
}) {
  const vocab = getTransactionVocabulary({
    donationType,
    categoryName,
    categorySlug,
    programTitle,
  });

  const safeFullName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";
  const greetingName = formatGreetingName(safeFullName, "Sahabat Kebaikan");

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
    text: vocab.buttonText,
    url: actionUrl,
    variant: "primary3d",
    showFallbackUrl: true,
    confidentialityNotice: `Catatan: Bukti transaksi ini sah dan bersifat pribadi. Simpan tautan ini dengan baik untuk ${vocab.archiveLabel} Anda.`,
  });

  const receiptItems = [
    { label: "Nomor Transaksi", value: invoiceId },
  ];

  if (safeFullName !== "Sahabat Kebaikan") {
    receiptItems.push({ label: vocab.partyLabel, value: `<span style="text-transform: uppercase;">${safeFullName}</span>` });
  }

  receiptItems.push(
    { label: vocab.programLabel, value: programTitle || vocab.programLabel },
    { label: vocab.nominalLabel, value: formatRupiah(amount), isHighlight: true },
    { label: "Waktu Pembayaran", value: `${formattedDate} WIB` },
    { label: "Metode Pembayaran", value: formatPaymentChannelLabel(paymentChannelName) }
  );

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading(vocab.heading)}

    <!-- Sapaan Hangat -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${greetingName}</span>,
    </p>

    <!-- Pembuka Natural & Santun Sesuai Syariat -->
    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      ${vocab.openingText}
    </p>

    <!-- Rincian Transaksi (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(receiptItems)}

    ${
      prayer
        ? `
    <!-- Titipan Doa (Simple Clean Block) -->
    <div style="margin: 16px 0 24px 0; padding: 12px 16px; border-left: 2px solid #94a3b8; font-family: ${EMAIL_FONT_STACK};">
      <span style="font-size: 14px; color: #374151; display: block; margin-bottom: 4px;">Titipan Doa & Hajat:</span>
      <span style="font-size: 15px; color: #111827; font-style: italic; line-height: 1.5;">"${prayer}"</span>
    </div>
    `
        : ""
    }

    <!-- Call to Action Button (Centered 3D) -->
    ${buttonHtml}

    <!-- Penutup & Doa Kontekstual -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      ${vocab.closingDoa}
    </p>

    <!-- Tanda Tangan Resmi Yayasan -->
    <div style="margin-top: 24px; font-family: ${EMAIL_FONT_STACK};">
      <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.5;">
        Salam takzim dan doa,<br />
        <strong style="color: #111827;">Yayasan Payung Berkah</strong><br />
        <span style="font-size: 13px; color: #374151;">Amanah, Transparan, dan Akuntabel</span>
      </p>
    </div>
  `.trim();

  return buildBaseEmailHtml({
    title: `${vocab.subjectPrefix}: ${programTitle} [${invoiceId}]`,
    contentHtml,
    logoUrl,
  });
}
