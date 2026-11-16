/**
 * Komponen Primitif Reusable untuk Email HTML Transaksional (DRY & SSOT).
 * Mendukung tata letak minimalis Clean Raw Text tanpa styling berlebih,
 * dengan font family seragam dan kompatibilitas tinggi lintas email client.
 */

export const EMAIL_FONT_STACK =
  "'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Memformat nama donatur/pengguna ke huruf kapital murni (UPPERCASE) tanpa perlakuan bold
 * @param {string} name - Nama penerima
 * @param {string} [fallback="Sahabat Kebaikan"] - Fallback default
 * @returns {string}
 */
export function formatRecipientName(name, fallback = "Sahabat Kebaikan") {
  if (!name) return `<span style="text-transform: uppercase;">${fallback}</span>`;
  const clean = String(name).trim();
  if (!clean || clean.toLowerCase() === "hamba allah") {
    return `<span style="text-transform: uppercase;">${fallback}</span>`;
  }
  return `<span style="text-transform: uppercase;">${clean}</span>`;
}

/**
 * Mengambil nama sapaan ramah dari nama lengkap (misal: "Muhammad Zaki" -> "Zaki")
 * @param {string} fullName - Nama lengkap
 * @param {string} [fallback="Sahabat Kebaikan"] - Fallback jika kosong atau Hamba Allah
 * @returns {string}
 */
export function formatGreetingName(fullName, fallback = "Sahabat Kebaikan") {
  if (!fullName) return fallback;
  const clean = String(fullName).trim();
  if (!clean || clean.toLowerCase() === "hamba allah") return fallback;

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return clean;

  const first = words[0];
  const second = words[1];
  // Jika kata pertama adalah awalan/gelar umum, gunakan kata kedua
  if (/^(m\.|m|moch|muh|muhammad|h\.|hj\.|ust\.|ustadz|bpk|ibu|pak|dr\.|drs\.)$/i.test(first) && second) {
    return second;
  }
  return first;
}

/**
 * Normalisasi nama saluran/metode pembayaran ke label yang rapi dan standar
 * @param {string} rawChannel
 * @returns {string}
 */
export function formatPaymentChannelLabel(rawChannel) {
  if (!rawChannel) return "Pembayaran Digital";
  const str = String(rawChannel).trim();
  const lower = str.toLowerCase();

  if (lower === "qris") return "QRIS";
  if (lower === "bca_va") return "BCA Virtual Account";
  if (lower === "bni_va") return "BNI Virtual Account";
  if (lower === "bri_va") return "BRI Virtual Account";
  if (lower === "mandiri_va") return "Mandiri Virtual Account";
  if (lower === "permata_va") return "Permata Virtual Account";
  if (lower.endsWith("_va")) {
    const bank = lower.replace("_va", "").toUpperCase();
    return `${bank} Virtual Account`;
  }
  return str;
}

/**
 * Membuat garis pemisah tipis minimalis antar bagian
 * @returns {string}
 */
/**
 * Membuat heading tebal eye-catching di awal pesan email
 * Rata kiri alami, ukuran lebih besar (24px), dan bold tegas (700)
 * @param {string} text - Judul konteks pesan
 * @returns {string}
 */
export function buildEmailHeading(text) {
  if (!text) return "";
  return `<h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3; font-family: ${EMAIL_FONT_STACK}; text-align: left;">${text}</h1>`;
}

/**
 * Membuat garis pemisah tipis minimalis antar bagian
 * @returns {string}
 */
export function buildEmailDivider() {
  return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />`;
}

/**
 * Membuat tabel daftar rincian (Key-Value) gaya raw text bersih
 * Tanpa warna latar belakang, tanpa border samping atau petak kaku.
 * Menggunakan suffix tanda titik dua (:) pada label kiri, kontras tinggi anti-redup (#1f2937 & #111827),
 * dan ketebalan font tegas (400 regular & 700 bold).
 * @param {Array<{label: string, value: string, isHighlight?: boolean}>} items
 * @returns {string}
 */
export function buildEmailKeyValueTable(items = []) {
  if (!items.length) return "";

  const rowsHtml = items
    .map((item) => {
      const cleanLabel = (item.label || "").replace(/:\s*$/, "").trim();
      const fontWeight = item.isHighlight ? "700" : "400";

      return `
    <tr>
      <td style="padding: 10px 0; font-size: 15px; color: #1f2937; font-weight: 400; vertical-align: top; width: 44%; font-family: ${EMAIL_FONT_STACK};">
        ${cleanLabel} :
      </td>
      <td style="padding: 10px 0; font-size: 15px; color: #111827; font-weight: ${fontWeight}; text-align: right; vertical-align: top; font-family: ${EMAIL_FONT_STACK};">
        ${item.value}
      </td>
    </tr>
  `;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; border-collapse: collapse;">
      ${rowsHtml}
    </table>
  `.trim();
}

/**
 * Membuat markup tombol Call-to-Action (CTA) 3D berkarakter (Selaras dengan variant primary3d pada Button.jsx)
 * Diposisikan presisi di tengah (centered) untuk estetika tata letak surat yang seimbang dengan teks bobot medium (500).
 * Dilengkapi dengan fallback raw text link dan catatan keamanan/kerahasiaan jika diperlukan.
 * @param {object} params
 * @param {string} params.text - Teks tombol
 * @param {string} params.url - URL target
 * @param {"primary" | "primary3d" | "emerald"} [params.variant="primary3d"] - Gaya tombol
 * @param {boolean} [params.showFallbackUrl=true] - Menampilkan fallback link raw text
 * @param {string} [params.confidentialityNotice=""] - Catatan kerahasiaan/keamanan data
 * @returns {string} Markup HTML tombol
 */
export function buildEmailCtaButton({
  text,
  url,
  variant = "primary3d",
  showFallbackUrl = true,
  confidentialityNotice = "",
}) {
  const isEmerald = variant === "emerald";

  const fallbackBlock =
    showFallbackUrl && url
      ? `
        <p style="margin: 16px 0 0 0; font-size: 13px; color: #374151; line-height: 1.5; font-family: ${EMAIL_FONT_STACK};">
          Jika tombol di atas bermasalah, salin dan tempel tautan berikut ke peramban Anda:<br />
          <a href="${url}" class="email-fallback-link" style="word-break: break-all; color: #1d4ed8; font-weight: 400; text-decoration: underline;">${url}</a>
        </p>
      `
      : "";

  const noticeBlock = confidentialityNotice
    ? `
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #374151; font-style: italic; line-height: 1.5; font-family: ${EMAIL_FONT_STACK};">
          ${confidentialityNotice}
        </p>
      `
    : "";

  if (isEmerald) {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
        <tr>
          <td align="center" style="text-align: center;">
            <a href="${url}" target="_blank" class="email-cta-btn" style="display: inline-block; background-color: #047857; color: #ffffff !important; text-decoration: none !important; font-family: ${EMAIL_FONT_STACK}; font-size: 15px; font-weight: 500; padding: 12px 28px; border-radius: 6px; text-align: center; mso-padding-alt: 0;">
              ${text}
            </a>
            ${fallbackBlock}
            ${noticeBlock}
          </td>
        </tr>
      </table>
    `.trim();
  }

  // 3D Embossed Blue Gradient (Centered, Sesuai gaya brand di homepage, font-weight 500)
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="text-align: center;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="15%" strokeweight="1px" strokecolor="#1e3a8a" fillcolor="#2563eb">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:'Google Sans',Arial,sans-serif;font-size:15px;font-weight:500;">${text}</center>
          </v:roundrect>
          <![endif]-->
          <a href="${url}" target="_blank" class="email-cta-btn" style="display: inline-block; background-color: #2563eb; background-image: linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none !important; font-family: ${EMAIL_FONT_STACK}; font-size: 15px; font-weight: 500; padding: 12px 28px; border-radius: 6px; border-top: 1px solid #93c5fd; border-left: 1px solid #3b82f6; border-right: 1px solid #3b82f6; border-bottom: 3px solid #1e3a8a; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 3px 8px rgba(37, 99, 235, 0.25); text-align: center; mso-padding-alt: 0;">
            ${text}
          </a>
          ${fallbackBlock}
          ${noticeBlock}
        </td>
      </tr>
    </table>
  `.trim();
}
