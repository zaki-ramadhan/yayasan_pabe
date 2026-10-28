/**
 * Template pesan WhatsApp apresiasi & notifikasi penutupan donasi rutin
 * ketika program/kampanye terkait telah selesai atau ditutup.
 *
 * @param {object} params
 * @param {string} params.donorName
 * @param {string} params.programTitle
 * @param {string} [params.catalogUrl]
 * @returns {string} Formatted WhatsApp message
 */
export function buildRoutineCompletionWhatsAppMessage({
  donorName,
  programTitle,
  catalogUrl,
}) {
  const greeting =
    donorName && donorName !== "Hamba Allah"
      ? `Bapak/Ibu ${donorName}`
      : "Sahabat Kebaikan";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
  const browseUrl = catalogUrl || `${appUrl}/program`;

  return (
    `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\n` +
    `Halo ${greeting},\n` +
    `Alhamdulillah, program kebaikan yang Anda dukung secara rutin:\n` +
    `📌 *${programTitle}*\n\n` +
    `telah resmi ditutup/tercapai dan siap disalurkan kepada para penerima manfaat.\n\n` +
    `Sehubungan dengan hal tersebut, *jadwal komitmen donasi rutin Anda untuk program ini telah dihentikan secara otomatis* dan tidak akan ada penerbitan invoice atau pengingat lanjutan.\n\n` +
    `Jazakumullah khairan katsiran atas kedermawanan dan keistiqomahan Anda. Semoga menjadi amal jariyah yang pahalanya berlipat ganda di sisi Allah SWT. Aamiin.\n\n` +
    `Jika Bapak/Ibu berkenan melanjutkan komitmen kebaikan pada program aktif lainnya, silakan kunjungi katalog program kami:\n` +
    `👉 ${browseUrl}\n\n` +
    `*Yayasan Payung Berkah (PABE)*\n` +
    `_Pemberitahuan resmi penutupan program donasi._`
  );
}
