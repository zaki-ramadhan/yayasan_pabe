/**
 * Komponen Primitif Reusable untuk Email HTML Transaksional (DRY & SSOT).
 * Mendukung kompatibilitas lintas email client (Gmail, Outlook Word engine VML, Apple Mail).
 */

/**
 * Membuat markup tombol Call-to-Action (CTA) berdaya tahan tinggi lintas client
 * @param {object} params
 * @param {string} params.text - Teks tombol
 * @param {string} params.url - URL target
 * @param {"primary3d" | "emerald"} [params.variant="primary3d"] - Gaya tombol
 * @returns {string} Markup HTML tombol dengan VML fallback untuk Outlook
 */
export function buildEmailCtaButton({ text, url, variant = "primary3d" }) {
  if (variant === "primary3d") {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 36px;">
        <tr>
          <td>
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:36px;v-text-anchor:middle;width:170px;" arcsize="15%" strokeweight="1px" strokecolor="#172554" fillcolor="#1d4ed8">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:normal;">${text}</center>
            </v:roundrect>
            <![endif]-->
            <a href="${url}" target="_blank" style="display: inline-block; background-color: #1d4ed8; background-image: linear-gradient(180deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 8px 18px; border-radius: 6px; border-top: 1px solid #60a5fa; border-left: 1px solid #2563eb; border-right: 1px solid #2563eb; border-bottom: 3px solid #172554; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 3px 6px rgba(29, 78, 216, 0.25); text-align: center; mso-padding-alt: 0;">
              ${text}
            </a>
          </td>
        </tr>
      </table>
    `.trim();
  }

  // Variant default flat
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 26px;">
      <tr>
        <td>
          <a href="${url}" target="_blank" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 8px 18px; border-radius: 6px; text-align: center;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}
