/**
 * Utility to trigger browser download of a CSV file from transaction data.
 * Includes UTF-8 BOM (\uFEFF) for seamless Microsoft Excel compatibility.
 *
 * @param {Array<object>} transactions - Array of transaction objects
 * @param {string} filename - Desired output filename
 */
export function exportTransactionsToCsv(transactions = [], filename = "laporan-transaksi-pabe.csv") {
  if (!transactions || transactions.length === 0) return;

  const headers = [
    "Tanggal",
    "Sumber",
    "Tipe",
    "Deskripsi",
    "Kategori",
    "Nominal",
    "Status",
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((t) => [
    escapeCell(t.formattedDate || t.date),
    escapeCell(t.source),
    escapeCell(t.typeLabel || t.type),
    escapeCell(t.description),
    escapeCell(t.category),
    escapeCell(t.amount),
    escapeCell(t.statusLabel || t.status),
  ]);

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\r\n");

  downloadCsv(filename, csvContent);
}

/**
 * Generic browser download trigger for CSV content.
 * Guarantees UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility.
 *
 * @param {string} filename - Output filename (e.g. data.csv)
 * @param {string} csvContent - Raw CSV text content
 */
export function downloadCsv(filename, csvContent) {
  if (!csvContent) return;
  const normalized = csvContent.startsWith("\uFEFF") ? csvContent : "\uFEFF" + csvContent;
  const blob = new Blob([normalized], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
