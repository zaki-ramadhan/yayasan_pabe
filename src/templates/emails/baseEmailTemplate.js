/**
 * Layout Dasar Email Transaksional Yayasan Payung Berkah (SSOT & DRY Layout).
 * Mengorkestrasi pembungkus email bergaya Postman, logo brand resmi dari Cloudflare R2,
 * dan footer hak cipta yang memenuhi standar aksesibilitas kontras tinggi WCAG AAA.
 */

/**
 * Menyusun template email lengkap dengan tata letak dasar terstandarisasi
 * @param {object} params
 * @param {string} params.title - Judul meta dokumen HTML
 * @param {string} params.contentHtml - Markup isi konten email
 * @param {string} [params.logoUrl] - URL publik logo resmi yayasan
 * @returns {string} Markup HTML email lengkap
 */
export function buildBaseEmailHtml({ title, contentHtml, logoUrl }) {
  const currentYear = new Date().getFullYear();
  const safeLogoUrl =
    logoUrl ||
    process.env.EMAIL_LOGO_URL ||
    `${(process.env.R2_PUBLIC_URL || "https://pub-d695853be49c485484cd7799dc192352.r2.dev").replace(/\/+$/, "")}/branding/logo-ypabe.png`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title || "Yayasan Payung Berkah"}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .email-card-body {
        padding: 28px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 16px 16px 40px 16px;">
    <tr>
      <td align="center">
        <!-- Kotak Konten Utama (Gaya Postman) -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; text-align: left;">
          <tr>
            <td class="email-card-body" style="padding: 40px 48px;">
              
              <!-- Brand Header Logo Resmi Yayasan (Jarak 36px ke Judul) -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 36px;">
                <tr>
                  <td>
                    <img src="${safeLogoUrl}" alt="Yayasan Payung Berkah" height="34" style="display: block; height: 34px; width: auto; max-width: 180px; object-fit: contain; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Konten Spesifik Email -->
              ${contentHtml}

            </td>
          </tr>
        </table>

        <!-- Footer Luar Kotak (Jarak 32px dari Kotak, Kontras Standar WCAG) -->
        <table role="presentation" width="100%" style="max-width: 540px; margin-top: 32px; text-align: center;">
          <tr>
            <td>
              <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.6;">
                &copy; ${currentYear} Yayasan Payung Berkah. Seluruh hak cipta dilindungi.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
