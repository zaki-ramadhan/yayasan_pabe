import { normalizeWhatsAppNumber } from "@/lib/routineSchedulerHelper";
import { formatRupiah } from "@/lib/formatters";
import { sendMockWhatsApp } from "./mockDriver";
import { sendMetaCloudWhatsApp } from "./metaCloudDriver";
import { sendFonnteWhatsApp } from "./fonnteDriver";

/**
 * Builds formatted text for routine donation reminders or automatic invoices.
 */
export function buildRoutineWhatsAppMessage({
  donorName,
  programTitle,
  amount,
  routineType,
  actionUrl,
  invoiceId = null,
}) {
  const greeting = donorName && donorName !== "Hamba Allah" ? `Bapak/Ibu ${donorName}` : "Sahabat Kebaikan";

  if (routineType === "AUTO_DONATION" && actionUrl) {
    return (
      `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\n` +
      `Halo ${greeting},\n` +
      `Alhamdulillah, hari ini adalah jadwal komitmen donasi rutin Anda untuk program:\n` +
      `📌 *${programTitle}*\n` +
      `💰 *Nominal: ${formatRupiah(amount)}*\n\n` +
      (invoiceId ? `Nomor Tagihan: *${invoiceId}*\n` : "") +
      `Tagihan donasi otomatis Anda telah diterbitkan. Silakan klik tautan di bawah ini untuk melihat QRIS & menunaikan donasi:\n` +
      `👉 ${actionUrl}\n\n` +
      `_Semoga Allah senantiasa melipatgandakan rezeki dan memberkahi setiap langkah kebaikan Anda. Aamiin._\n\n` +
      `*Yayasan PABE (Generasi Sejahtera Mandiri)*\n` +
      `_Pesan ini dikirim otomatis berdasarkan jadwal donasi rutin yang Anda daftarkan._`
    );
  }

  // Fallback: Pengingat Saja (Reminder Only)
  return (
    `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\n` +
    `Halo ${greeting},\n` +
    `Mengingatkan kembali bahwa hari ini adalah jadwal donasi rutin Anda untuk program:\n` +
    `📌 *${programTitle}*\n\n` +
    `Anda dapat menunaikan donasi melalui tautan aman berikut ini:\n` +
    `👉 ${actionUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/donasi-rutin`}\n\n` +
    `_Terima kasih atas keistiqomahan Anda dalam menebar kebaikan._\n\n` +
    `*Yayasan PABE (Generasi Sejahtera Mandiri)*`
  );
}

/**
 * Unified WhatsApp dispatcher using active driver.
 */
export async function sendWhatsAppNotification({
  to,
  donorName,
  programTitle,
  amount,
  routineType,
  actionUrl,
  invoiceId = null,
}) {
  const normalizedPhone = normalizeWhatsAppNumber(to);
  if (!normalizedPhone) {
    throw new Error(`Nomor telepon penerima tidak valid: ${to}`);
  }

  const messageText = buildRoutineWhatsAppMessage({
    donorName,
    programTitle,
    amount,
    routineType,
    actionUrl,
    invoiceId,
  });

  const activeDriver = (process.env.WA_DRIVER || "mock").toLowerCase();

  switch (activeDriver) {
    case "meta":
      return await sendMetaCloudWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl,
      });

    case "fonnte":
      return await sendFonnteWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl,
      });

    case "mock":
    default:
      return await sendMockWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl,
        routineType,
      });
  }
}

/**
 * Dispatcher WhatsApp khusus untuk pemberitahuan penutupan program donasi rutin.
 */
export async function sendWhatsAppCompletionNotification({
  to,
  donorName,
  programTitle,
  catalogUrl,
}) {
  const normalizedPhone = normalizeWhatsAppNumber(to);
  if (!normalizedPhone) {
    throw new Error(`Nomor telepon penerima tidak valid: ${to}`);
  }

  const { buildRoutineCompletionWhatsAppMessage } = await import("./completionTemplate");
  const messageText = buildRoutineCompletionWhatsAppMessage({
    donorName,
    programTitle,
    catalogUrl,
  });

  const activeDriver = (process.env.WA_DRIVER || "mock").toLowerCase();

  switch (activeDriver) {
    case "meta":
      return await sendMetaCloudWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl: catalogUrl,
      });

    case "fonnte":
      return await sendFonnteWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl: catalogUrl,
      });

    case "mock":
    default:
      return await sendMockWhatsApp({
        to: normalizedPhone,
        message: messageText,
        actionUrl: catalogUrl,
        routineType: "COMPLETION",
      });
  }
}
