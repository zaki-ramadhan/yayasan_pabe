/**
 * Helper to identify document types and map them to dedicated file-type icons in /img/icons.
 * Supported assets:
 * - /img/icons/pdf.png
 * - /img/icons/doc.png
 * - /img/icons/xls.png
 * - /img/icons/default-file.png
 */

/**
 * Checks if a file name or URL is a non-image document format.
 * @param {string|File|object} fileNameOrUrl
 * @param {boolean} [isExplicitDoc=false]
 * @returns {boolean}
 */
export function isDocumentFile(fileNameOrUrl, isExplicitDoc = false) {
  if (isExplicitDoc) return true;
  if (!fileNameOrUrl) return false;

  const type =
    typeof fileNameOrUrl === "object" ? fileNameOrUrl?.type || "" : "";
  const name =
    typeof fileNameOrUrl === "string"
      ? fileNameOrUrl
      : fileNameOrUrl?.name || "";

  const clean = name.toLowerCase().split("?")[0];
  const cleanType = type.toLowerCase();

  return (
    clean.endsWith(".pdf") ||
    clean.endsWith(".doc") ||
    clean.endsWith(".docx") ||
    clean.endsWith(".xls") ||
    clean.endsWith(".xlsx") ||
    clean.endsWith(".csv") ||
    clean.endsWith(".txt") ||
    clean.endsWith(".rtf") ||
    clean.endsWith(".odt") ||
    clean.includes(".pdf") ||
    clean.includes("(pdf)") ||
    /\bpdf\b/i.test(clean) ||
    cleanType.includes("pdf") ||
    cleanType.includes("document") ||
    cleanType.includes("sheet") ||
    cleanType.includes("msword") ||
    clean.includes("type=audit")
  );
}

/**
 * Resolves the appropriate icon path from /img/icons based on file extension / MIME type / context.
 * @param {string|File|object} fileNameOrUrl
 * @param {string} [contextOrMime=""]
 * @returns {string} Relative public path to the icon image
 */
export function getFileIconAsset(fileNameOrUrl, contextOrMime = "") {
  const mime = (typeof contextOrMime === "string" ? contextOrMime : "").toLowerCase();

  const fileType =
    typeof fileNameOrUrl === "object" && fileNameOrUrl?.type
      ? String(fileNameOrUrl.type).toLowerCase()
      : "";

  const name =
    typeof fileNameOrUrl === "string"
      ? fileNameOrUrl
      : fileNameOrUrl?.name || "";

  const clean = name.toLowerCase().split("?")[0];

  // 1. PDF detection (explicit context, mime, filename, or label)
  if (
    mime.includes("pdf") ||
    fileType.includes("pdf") ||
    clean.endsWith(".pdf") ||
    clean.includes(".pdf") ||
    clean.includes("(pdf)") ||
    /\bpdf\b/i.test(clean) ||
    clean.includes("type=audit") ||
    clean.includes("application/pdf")
  ) {
    return "/img/icons/pdf.png";
  }

  // 2. Word / DOC detection
  if (
    mime.includes("doc") ||
    mime.includes("word") ||
    fileType.includes("word") ||
    fileType.includes("msword") ||
    clean.endsWith(".doc") ||
    clean.endsWith(".docx") ||
    clean.includes(".doc") ||
    clean.includes(".docx") ||
    clean.includes("(doc)") ||
    clean.includes("(docx)") ||
    /\b(doc|docx)\b/i.test(clean) ||
    clean.includes("msword") ||
    clean.includes("wordprocessingml")
  ) {
    return "/img/icons/doc.png";
  }

  // 3. Excel / Spreadsheet / CSV detection
  if (
    mime.includes("xls") ||
    mime.includes("excel") ||
    mime.includes("sheet") ||
    mime.includes("csv") ||
    fileType.includes("spreadsheet") ||
    fileType.includes("excel") ||
    fileType.includes("csv") ||
    clean.endsWith(".xls") ||
    clean.endsWith(".xlsx") ||
    clean.endsWith(".csv") ||
    clean.includes(".xls") ||
    clean.includes(".xlsx") ||
    clean.includes(".csv") ||
    clean.includes("(xls)") ||
    clean.includes("(xlsx)") ||
    clean.includes("(csv)") ||
    /\b(xls|xlsx|csv)\b/i.test(clean) ||
    clean.includes("spreadsheet") ||
    clean.includes("excel")
  ) {
    return "/img/icons/xls.png";
  }

  return "/img/icons/default-file.png";
}

