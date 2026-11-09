import { buildBaseEmailHtml } from "./baseEmailTemplate";
import { buildEmailCtaButton } from "./emailComponents";
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
  logoUrl,
}) {
  const safeName = donorName && donorName !== "Hamba Allah" ? donorName.trim() : "Sahabat Kebaikan";
  const isAutoDonation = routineType === "AUTO_DONATION";

  const buttonText = isAutoDonation ? "Tunaikan Donasi via QRIS" : "Buka Program Donasi";
  const buttonHtml = buildEmailCtaButton({
    text: buttonText,
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
      ${
        isAutoDonation
          ? "Alhamdulillah, hari ini adalah jadwal komitmen donasi rutin Anda. Tagihan resmi dan kode QRIS telah berhasil diterbitkan oleh sistem:"
          : "Mengingatkan kembali bahwa hari ini adalah jadwal kebaikan donasi rutin Anda untuk program berikut:"
      }
    </p>

    <!-- Kotak Ringkasan Rincian Donasi -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: separate; overflow: hidden;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 4px;">
            Program Donasi
          </span>
          <span style="font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.4;">
            ${programTitle}
          </span>
        </td>
      </tr>
      ${
        isAutoDonation && amount > 0
          ? `
      <tr>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                  Nominal Donasi
                </span>
              </td>
              <td align="right">
                <span style="font-size: 17px; font-weight: 700; color: #1e3a8a;">
                  ${formatRupiah(amount)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding: 12px 20px; font-size: 13px; color: #475569;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="color: #64748b;">Jadwal Komitmen</td>
              <td align="right" style="font-weight: 500; color: #1e293b;">${frequencyText}</td>
            </tr>
            ${
              invoiceId
                ? `
            <tr>
              <td style="color: #64748b; padding-top: 6px;">Nomor Tagihan</td>
              <td align="right" style="font-weight: 600; color: #1e293b; padding-top: 6px; font-family: monospace;">${invoiceId}</td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <!-- Tombol Aksi Utama -->
    ${buttonHtml}

    <!-- Doa & Penutup -->
    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6; font-style: italic;">
      “Semoga Allah SWT senantiasa melipatgandakan rezeki, memberikan kesehatan, dan memberkahi setiap langkah kebaikan Anda beserta keluarga. Aamiin ya Rabbal ’Alamin.”
    </p>

    <!-- Informasi Pengelolaan Jadwal Mandiri -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding-top: 20px; border-top: 1px solid #f1f5f9;">
      <tr>
        <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          Anda menerima email ini karena mendaftarkan komitmen donasi rutin di Yayasan Payung Berkah.
          Anda dapat menjeda atau membatalkan komitmen donasi ini kapan saja melalui menu <strong>Donasi Rutin</strong> di dasbor donatur Anda.
        </td>
      </tr>
    </table>
  `.trim();

  return buildBaseEmailHtml({
    title: getRoutineInvoiceEmailSubject(programTitle, invoiceId),
    contentHtml,
    logoUrl,
  });
}
