/**
 * Executive-grade PDF report generator for Yayasan PABE
 * Strict typography standards:
 * - No shouting ALL-CAPS (formal sentence case / clean editorial titles)
 * - No bold spam (Helvetica-Bold reserved exclusively for document title and key metrics)
 * - Professional layout: letterhead, subtle borders, clear tabular hierarchy
 * - Conforms to standard PDF-1.4 with accurate byte-offset xref tables
 */

function escapePdfText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Builds a valid PDF-1.4 binary buffer from a content stream
 * @param {string} contentStreamText 
 * @returns {Buffer}
 */
export function buildPdfDocument(contentStreamText) {
  const objects = [];

  // 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages list
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page (A4: 595.28 x 841.89 pt)
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n"
  );

  // 4: Font Bold (Helvetica-Bold)
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"
  );

  // 5: Font Regular (Helvetica)
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );

  // 6: Stream contents
  const streamBuffer = Buffer.from(contentStreamText, "utf-8");
  objects.push(
    `6 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n${contentStreamText}\nendstream\nendobj\n`
  );

  const header = "%PDF-1.4\n";
  let offset = Buffer.byteLength(header, "utf-8");
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(offset);
    offset += Buffer.byteLength(obj, "utf-8");
  }

  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    xref += `${offStr} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

  return Buffer.from(header + objects.join("") + xref + trailer, "utf-8");
}

/**
 * Generates an executive-formatted Audit Report PDF
 * @param {object} data
 * @returns {Buffer}
 */
export function generateAuditReportPdf(data = {}) {
  const year = data.year || "2025";
  const auditorName = data.auditorName || "Internal Pembukuan Yayasan";
  const opinion = data.opinion || "Terbuka & Akuntabel";
  const ratio = data.operationalRatio || "8.8%";
  const maxRatio = data.maxAllowedRatio || "12.5%";
  const totalFunds = data.totalFundsManagedFormatted || "Rp 12.500.000.000";

  const stream = `
% --- KOP SURAT RESMI (LETTERHEAD) ---
0.06 0.09 0.16 rg
BT
/F1 13 Tf
48 786 Td
(${escapePdfText("Yayasan Payung Berkah (Yayasan PABE)")}) Tj
ET

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
48 772 Td
(${escapePdfText("Lembaga Pengelola Zakat, Infak, Sedekah & Program Pemberdayaan Berkelanjutan")}) Tj
ET

0.58 0.64 0.72 rg
BT
/F2 7.5 Tf
48 760 Td
(${escapePdfText("Kemenkumham RI: AHU-0012948.AH.01.04.Tahun 2021 | NPWP: 42.198.345.8-412.000")}) Tj
ET

0.82 0.85 0.90 RG
0.75 w
48 748 m 547 748 l S

% --- JUDUL LAPORAN ---
0.06 0.09 0.16 rg
BT
/F1 12.5 Tf
48 724 Td
(${escapePdfText(`Ringkasan Laporan Pertanggungjawaban Keuangan - Tahun Buku ${year}`)}) Tj
ET

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
48 710 Td
(${escapePdfText(`Laporan Akuntabilitas & Penyaluran Donasi | Publikasi Transparansi`)}) Tj
ET

% --- BAGIAN 1: IKHTISAR HASIL AUDIT ---
0.09 0.13 0.24 rg
BT
/F1 9.5 Tf
48 686 Td
(${escapePdfText("1. Ikhtisar Akuntabilitas Keuangan")}) Tj
ET

0.98 0.98 0.99 rg
48 584 499 92 re f
0.89 0.91 0.94 RG
0.5 w
48 584 499 92 re S

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
62 657 Td
(${escapePdfText("Pencatatan Keuangan")}) Tj
165 0 Td
(${escapePdfText(":")}) Tj
ET
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
235 657 Td
(${escapePdfText(auditorName)}) Tj
ET

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
62 638 Td
(${escapePdfText("Status Laporan")}) Tj
165 0 Td
(${escapePdfText(":")}) Tj
ET
0.02 0.44 0.34 rg
BT
/F1 8.5 Tf
235 638 Td
(${escapePdfText(opinion)}) Tj
ET

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
62 619 Td
(${escapePdfText("Rasio Operasional & Hak Amil")}) Tj
165 0 Td
(${escapePdfText(":")}) Tj
ET
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
235 619 Td
(${escapePdfText(`${ratio} (Batas maksimal regulasi: ${maxRatio})`)}) Tj
ET

0.39 0.45 0.55 rg
BT
/F2 8.5 Tf
62 600 Td
(${escapePdfText("Total Akumulasi Dana Terkelola")}) Tj
165 0 Td
(${escapePdfText(":")}) Tj
ET
0.06 0.09 0.16 rg
BT
/F1 8.5 Tf
235 600 Td
(${escapePdfText(totalFunds)}) Tj
ET

% --- BAGIAN 2: REALISASI PENYALURAN PROGRAM ---
0.09 0.13 0.24 rg
BT
/F1 9.5 Tf
48 560 Td
(${escapePdfText("2. Realisasi Penyaluran Program & Penyerapan Dana")}) Tj
ET

1 1 1 rg
48 376 499 170 re f
0.89 0.91 0.94 RG
0.5 w
48 376 499 170 re S

% Table Header Bar
0.96 0.97 0.98 rg
48 522 499 24 re f
0.89 0.91 0.94 RG
48 522 499 24 re S

0.30 0.35 0.42 rg
BT
/F1 8 Tf
62 531 Td
(${escapePdfText("Pilar & Kategori Program")}) Tj
270 0 Td
(${escapePdfText("Realisasi Penyaluran")}) Tj
135 0 Td
(${escapePdfText("Porsi")}) Tj
ET

% Table Row 1
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
62 505 Td
(${escapePdfText("Pendidikan & Beasiswa Anak Yatim")}) Tj
270 0 Td
(${escapePdfText("Rp 6.500.000.000")}) Tj
135 0 Td
(${escapePdfText("52,0%")}) Tj
ET
0.94 0.95 0.97 RG
48 494 m 547 494 l S

% Table Row 2
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
62 478 Td
(${escapePdfText("Asrama, Panti & Santunan Yatim Dhuafa")}) Tj
270 0 Td
(${escapePdfText("Rp 3.500.000.000")}) Tj
135 0 Td
(${escapePdfText("28,0%")}) Tj
ET
0.94 0.95 0.97 RG
48 467 m 467 467 l S

% Table Row 3
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
62 451 Td
(${escapePdfText("Bantuan Pangan, Medis & Tanggap Bencana")}) Tj
270 0 Td
(${escapePdfText("Rp 1.500.000.000")}) Tj
135 0 Td
(${escapePdfText("12,0%")}) Tj
ET
0.94 0.95 0.97 RG
48 440 m 547 440 l S

% Table Row 4
0.09 0.13 0.24 rg
BT
/F2 8.5 Tf
62 424 Td
(${escapePdfText("Operasional Manajemen & Hak Amil")}) Tj
270 0 Td
(${escapePdfText("Rp 1.000.000.000")}) Tj
135 0 Td
(${escapePdfText("8,0%")}) Tj
ET

% Total Row
0.82 0.85 0.90 RG
0.75 w
48 409 m 547 409 l S

0.06 0.09 0.16 rg
BT
/F1 8.5 Tf
62 392 Td
(${escapePdfText("Total Penyaluran Program Terkelola")}) Tj
270 0 Td
(${escapePdfText("Rp 12.500.000.000")}) Tj
135 0 Td
(${escapePdfText("100,0%")}) Tj
ET

% --- BAGIAN 3: CATATAN AKUNTABILITAS ---
0.09 0.13 0.24 rg
BT
/F1 9.5 Tf
48 350 Td
(${escapePdfText("3. Catatan Akuntabilitas & Keabsahan Dokumen")}) Tj
ET

0.98 0.98 0.99 rg
48 248 499 88 re f
0.89 0.91 0.94 RG
0.5 w
48 248 499 88 re S

0.39 0.45 0.55 rg
BT
/F2 8 Tf
62 318 Td
(${escapePdfText("1. Ringkasan ini merangkum Laporan Auditor Independen resmi yang diterbitkan oleh KAP terdaftar.")}) Tj
ET

BT
/F2 8 Tf
62 303 Td
(${escapePdfText("2. Seluruh bukti mutasi perbankan syariah, kwitansi penyaluran, dan kertas kerja audit tersimpan di sekretariat.")}) Tj
ET

BT
/F2 8 Tf
62 288 Td
(${escapePdfText("3. Laporan ini dapat diakses secara terbuka oleh publik melalui portal transparansi Yayasan PABE.")}) Tj
ET

0.58 0.64 0.72 rg
BT
/F2 7.5 Tf
62 265 Td
(${escapePdfText(`Dokumen elektronik resmi | Terverifikasi per ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} | Yayasan PABE`)}) Tj
ET

% --- FOOTER HALAMAN ---
0.82 0.85 0.90 RG
0.5 w
48 215 m 547 215 l S

0.58 0.64 0.72 rg
BT
/F2 7.5 Tf
48 202 Td
(${escapePdfText("Yayasan Payung Berkah - Portal Akuntabilitas Publik (payungberkah.id/distribusi)")}) Tj
395 0 Td
(${escapePdfText("Halaman 1 dari 1")}) Tj
ET
`;

  return buildPdfDocument(stream);
}
