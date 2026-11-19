import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailHeading, buildEmailKeyValueTable, buildEmailCtaButton, EMAIL_FONT_STACK } from "./emailComponents";

/**
 * Membuat konten HTML email notifikasi transaksi baru ke bendahara / pengurus yayasan
 * @param {object} params
 * @param {string} params.invoiceId
 * @param {string} params.donorName
 * @param {string} params.programTitle
 * @param {number} params.amount
 * @param {string} params.paymentChannel
 * @param {Date|string} params.paidAt
 * @param {string} params.donationType
 * @param {string} [params.zakatType]
 * @param {string} [params.adminDashboardUrl]
 * @param {string} [params.logoUrl]
 * @returns {string} Markup HTML email
 */
export function buildDonationAdminAlertEmailHtml({
  invoiceId,
  donorName,
  programTitle,
  amount,
  paymentChannel,
  paidAt,
  donationType = "CAMPAIGN",
  zakatType = null,
  adminDashboardUrl,
  logoUrl,
}) {
  const typeLabel = donationType === "ZAKAT" ? "Zakat" : "Donasi";
  const subTypeInfo = zakatType ? ` (${zakatType.replace(/_/g, " ")})` : "";
  const formattedAmount = `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
  const formattedDate = paidAt ? new Date(paidAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

  const alertItems = [
    { label: "Nomor Invoice", value: invoiceId, isHighlight: true },
    { label: "Jenis Transaksi", value: `${typeLabel}${subTypeInfo}` },
    { label: "Program Tujuan", value: programTitle || "Program Yayasan" },
    { label: "Nama Donatur", value: donorName || "Hamba Allah" },
    { label: "Nominal Masuk", value: formattedAmount, isHighlight: true },
    { label: "Kanal Pembayaran", value: paymentChannel || "Digital Payment" },
    { label: "Waktu Pembayaran", value: formattedDate },
  ];

  const ctaButtonHtml = adminDashboardUrl
    ? buildEmailCtaButton({
        text: "Buka Mutasi Transaksi di Panel Admin",
        url: adminDashboardUrl,
      })
    : "";

  const contentHtml = `
    ${buildEmailHeading(`Penerimaan ${typeLabel} Baru Terverifikasi`)}

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
      Pemberitahuan Sistem: Terdapat transaksi penerimaan dana <strong>${typeLabel}</strong> baru yang telah berhasil diproses dan diverifikasi lunas melalui Payment Gateway.
    </p>

    ${buildEmailKeyValueTable(alertItems)}

    ${ctaButtonHtml}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280; line-height: 1.5; font-family: ${EMAIL_FONT_STACK};">
      Notifikasi ini dihasilkan secara otomatis oleh sistem pencatatan keuangan Yayasan Payung Berkah. Silakan lakukan rekonsiliasi kas secara berkala pada panel admin.
    </p>
  `.trim();

  return buildBaseEmailHtml({
    title: `Notifikasi Penerimaan ${typeLabel}: ${formattedAmount} - Yayasan PABE`,
    contentHtml,
    logoUrl,
  });
}
