import { buildBaseEmailHtml } from "./baseEmailTemplate";
import {
  buildEmailHeading,
  buildEmailCtaButton,
  buildEmailKeyValueTable,
  EMAIL_FONT_STACK,
} from "./emailComponents";
import { formatRupiah } from "@/lib/formatters";

/**
 * Subject email standar untuk invoice donasi rutin
 * @param {string} programTitle
 * @param {string|null} invoiceId
 * @returns {string}
 */
export function getRoutineInvoiceEmailSubject(programTitle, invoiceId = null) {
  if (invoiceId) {
    return `Tagihan Donasi Rutin: ${programTitle} [${invoiceId}]`;
  }
  return `Jadwal Pengingat Donasi Rutin: ${programTitle}`;
}

/**
 * Membuat konten HTML email invoice / pengingat donasi rutin (SRP & Modular)
 * @param {object} params
 * @param {string} params.donorName - Nama donatur
 * @param {string} params.programTitle - Judul program donasi
 * @param {number} params.amount - Nominal donasi
 * @param {string} params.frequencyText - Keterangan jadwal (misal: "Setiap Pekan (Jumat)")
 * @param {string|null} [params.invoiceId] - ID tagihan jika auto-invoice
 * @param {string} params.actionUrl - Tautan langsung menuju halaman pembayaran QRIS / program
 * @param {"AUTO_DONATION" | "REMINDER_ONLY"} [params.routineType="AUTO_DONATION"] - Model eksekusi
 * @param {string} [params.logoUrl] - URL logo publik
 * @returns {string} Markup HTML email lengkap
 */
export function buildRoutineDonationInvoiceEmailHtml({
  donorName,
  programTitle,
  amount,
  frequencyText = "Setiap Pekan",
  invoiceId = null,
  actionUrl,
  routineType = "AUTO_DONATION",
  paymentChannel = "qris",
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";
  const isAutoDonation = routineType === "AUTO_DONATION";

  const CHANNEL_NAMES = {
    qris: "QRIS (Semua Bank & E-Wallet)",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    bca_va: "BCA Virtual Account",
    mandiri_va: "Mandiri Bill Payment",
    bri_va: "BRI Virtual Account",
    bsi_va: "BSI Virtual Account",
  };
  const channelLabel = CHANNEL_NAMES[paymentChannel] || "QRIS";
  const isQrisFamily = !paymentChannel || paymentChannel === "qris" || paymentChannel === "gopay" || paymentChannel === "shopeepay";

  const buttonText = isAutoDonation
    ? isQrisFamily
      ? "Tunaikan Donasi via QRIS"
      : "Buka Instruksi Pembayaran VA"
    : "Buka Program Donasi";

  const buttonHtml = buildEmailCtaButton({
    text: buttonText,
    url: actionUrl,
    variant: "primary3d",
    showFallbackUrl: true,
    confidentialityNotice: isAutoDonation
      ? "Catatan: Tautan tagihan ini bersifat pribadi. Jangan teruskan atau bagikan email ini kepada pihak lain."
      : "",
  });

  const detailItems = [
    { label: "Program Donasi", value: programTitle },
  ];

  if (isAutoDonation && amount > 0) {
    detailItems.push({
      label: "Nominal Donasi",
      value: formatRupiah(amount),
      isHighlight: true,
    });
  }

  detailItems.push({ label: "Jadwal Komitmen", value: frequencyText });

  if (invoiceId) {
    detailItems.push({ label: "Nomor Tagihan", value: invoiceId });
    detailItems.push({ label: "Metode Pembayaran", value: channelLabel });
  }

  const contentHtml = `
    <!-- Judul Konteks Eye-Catching -->
    ${buildEmailHeading(isAutoDonation ? "Tagihan Donasi Rutin" : "Jadwal Pengingat Donasi")}

    <!-- Sapaan -->
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Halo <span style="text-transform: uppercase;">${safeName}</span>,
    </p>

    <!-- Pembuka -->
    <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      ${
        isAutoDonation
          ? `Alhamdulillah, hari ini adalah jadwal komitmen donasi rutin Anda. Tagihan resmi ${isQrisFamily ? "dan kode QRIS" : "dan nomor Virtual Account"} telah berhasil diterbitkan oleh sistem:`
          : "Mengingatkan kembali bahwa hari ini adalah jadwal kebaikan donasi rutin Anda untuk program berikut:"
      }
    </p>

    <!-- Rincian Donasi (Clean Raw Text Table) -->
    ${buildEmailKeyValueTable(detailItems)}

    <!-- Tombol Aksi Utama -->
    ${buttonHtml}

    <!-- Doa & Penutup -->
    <p style="margin: 0 0 18px 0; font-size: 15px; color: #111827; line-height: 1.6; font-style: italic; font-family: ${EMAIL_FONT_STACK};">
      “Semoga Allah SWT senantiasa melipatgandakan rezeki, memberikan kesehatan, dan memberkahi setiap langkah kebaikan Anda beserta keluarga. Aamiin ya Rabbal ’Alamin.”
    </p>

    <!-- Informasi Pengelolaan Jadwal Mandiri -->
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Anda menerima email ini karena terdaftar pada komitmen donasi rutin Yayasan Payung Berkah. Anda dapat menjeda atau menyesuaikan jadwal ini kapan saja melalui menu <a href="${actionUrl}">Donasi Rutin</a> di dasbor donatur.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: getRoutineInvoiceEmailSubject(programTitle, invoiceId),
    contentHtml,
    logoUrl,
  });
}
