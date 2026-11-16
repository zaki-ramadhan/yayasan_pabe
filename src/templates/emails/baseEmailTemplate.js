import { EMAIL_FONT_STACK } from "./emailComponents";

/**
 * Layout Dasar Email Transaksional Yayasan Payung Berkah (SSOT & Minimalist Raw Text Layout).
 * Mengusung gaya korespondensi surat resmi/personal yang bersih (clean letterhead),
 * tanpa pembungkus card, tanpa dekorasi shape/warna pastel kaku, dan font family Google Sans seragam.
 */

/**
 * Menyusun template email lengkap dengan tata letak dasar terstandarisasi tanpa card wrapper
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
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title || "Yayasan Payung Berkah"}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: 'Google Sans', Arial, Helvetica, sans-serif !important; }
    strong, b { font-weight: 700 !important; }
    h1, h2, h3 { font-weight: 700 !important; }
    a { color: #1d4ed8 !important; text-decoration: underline !important; font-weight: 700 !important; }
    a.email-cta-btn { color: #ffffff !important; text-decoration: none !important; font-weight: 500 !important; }
    a.email-fallback-link { color: #1d4ed8 !important; text-decoration: underline !important; font-weight: 400 !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td, p, a, span { font-family: ${EMAIL_FONT_STACK}; }
    strong, b { font-weight: 700 !important; }
    h1, h2, h3 { font-weight: 700 !important; }
    a {
      color: #1d4ed8;
      font-weight: 700;
      text-decoration: underline;
    }
    a.email-cta-btn {
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 500 !important;
    }
    a.email-fallback-link {
      color: #1d4ed8 !important;
      text-decoration: underline !important;
      font-weight: 400 !important;
      word-break: break-all;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: ${EMAIL_FONT_STACK}; -webkit-font-smoothing: antialiased; color: #111827; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 24px 16px 48px 16px;">
    <tr>
      <td align="center">
        <!-- Container Teks Utama Bersih (Tanpa Card, Tanpa Border) -->
        <table role="presentation" width="100%" style="max-width: 580px; text-align: left; background-color: #ffffff;">
          <tr>
            <td style="padding: 0; font-family: ${EMAIL_FONT_STACK};">
              
              <!-- Brand Header Logo Minimalis Resmi -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <img src="${safeLogoUrl}" alt="Yayasan Payung Berkah" height="32" style="display: block; height: 32px; width: auto; max-width: 170px; object-fit: contain; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Konten Spesifik Email (Clean Raw Text) -->
              ${contentHtml}

              <!-- Garis Pemisah Tipis Menuju Footer -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />

              <!-- Footer Minimalis Kontras Tinggi -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 14px; color: #374151; line-height: 1.6; font-family: ${EMAIL_FONT_STACK};">
                    &copy; ${currentYear} Yayasan Payung Berkah. Seluruh hak cipta dilindungi.<br />
                    Pemberitahuan amanah resmi dari sistem informasi Yayasan Payung Berkah.
                  </td>
                </tr>
              </table>

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
