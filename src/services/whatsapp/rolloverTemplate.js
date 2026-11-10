/**
 * Template pesan WhatsApp notifikasi pengalihan donasi rutin
 * saat program sebelumnya telah selesai atau ditutup.
 *
 * @param {object} params
 * @param {string} params.donorName
 * @param {string} params.oldProgramTitle
 * @param {string} params.newProgramTitle
 * @param {string} [params.actionUrl]
 * @returns {string} Formatted WhatsApp message
 */
export function buildRoutineRolloverWhatsAppMessage({
  donorName,
  oldProgramTitle,
  newProgramTitle,
  actionUrl,
}) {
  const greeting =
    donorName && donorName !== "Hamba Allah"
      ? `Bapak/Ibu ${donorName}`
      : "Sahabat Kebaikan";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
  const dashboardUrl = actionUrl || `${appUrl}/donatur/dashboard`;

  return (
    `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\n` +
    `Halo ${greeting},\n` +
    `Alhamdulillah, program kebaikan yang Anda dukung secara rutin:\n` +
    `📌 *${oldProgramTitle}*\n` +
    `kini telah resmi selesai dan target penyalurannya telah terpenuhi dengan baik.\n\n` +
    `Agar aliran pahala sedekah rutin Anda terus terjaga tanpa terputus, komitmen donasi rutin Anda telah dialihkan secara otomatis ke program aktif:\n` +
    `🌟 *${newProgramTitle}*\n\n` +
    `Jadwal dan nominal donasi Anda tetap sama. Anda dapat melihat rincian program atau mengubah preferensi jadwal kapan saja melalui tautan berikut:\n` +
    `👉 ${dashboardUrl}\n\n` +
    `Jazakumullah khairan katsiran atas keistiqomahan Anda bersama Yayasan Payung Berkah. Semoga berkah berlimpah untuk keluarga Anda. Aamiin.\n\n` +
    `*Yayasan Payung Berkah (PABE)*\n` +
    `_Pemberitahuan resmi pengalihan komitmen donasi._`
  );
}

