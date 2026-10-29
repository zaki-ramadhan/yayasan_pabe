/**
 * Menghapus seluruh karakter emoji, simbol piktografik, dan modifikator Unicode.
 */
export function stripEmojis(input) {
  if (typeof input !== "string") return "";
  return input.replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\uFE0F\u200D]/gu,
    ""
  );
}

/**
 * Sanitasi teks umum (pembersihan tag HTML, simbol berbahaya, dan emoji).
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  const noEmoji = stripEmojis(input);
  return noEmoji
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Sanitasi input nama orang/donatur (hanya alfabet, spasi, titik, koma, petik, strip; tanpa emoji/angka).
 * Otomatis mencegah spasi di awal (leading space) dan mengompresi spasi ganda.
 */
export function sanitizeName(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 60);
}

/**
 * Sanitasi nama kota / kabupaten domisili (hanya huruf, spasi, titik, strip; tanpa emoji/angka).
 * Otomatis mencegah spasi di awal dan mengompresi spasi ganda.
 */
export function sanitizeCity(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/[^a-zA-ZÀ-ÿ\s.\-]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 50);
}

/**
 * Sanitasi nomor rekening bank (hanya digit numerik, maksimal 30 digit).
 */
export function sanitizeBankAccount(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\D/g, "").slice(0, 30);
}

/**
 * Sanitasi atas nama pemilik rekening bank (hanya alfabet dan tanda baca nama wajar).
 */
export function sanitizeBankAccountName(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<[^>]*>?/gm, "")
    .replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 60);
}

/**
 * Sanitasi nomor HP/WhatsApp (hanya angka digit, maksimal 15 digit).
 */
export function sanitizePhone(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\D/g, "").slice(0, 15);
}

/**
 * Sanitasi alamat email (tanpa spasi, tanpa emoji, lowercase, maksimal 100 karakter).
 */
export function sanitizeEmail(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\s/g, "").toLowerCase().slice(0, 100);
}

/**
 * Sanitasi doa atau pesan donatur (mendukung emoji ekspresif, tanpa tag HTML, maksimal 200 karakter).
 */
export function sanitizePrayer(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 200);
}

/**
 * Menghitung jumlah karakter visual nyata (Grapheme Cluster).
 */
export function countGraphemes(input) {
  if (typeof input !== "string" || !input) return 0;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("id", { granularity: "grapheme" });
    return [...segmenter.segment(input)].length;
  }
  return [...input].length;
}

/**
 * Memeriksa apakah teks doa mengandung kata atau huruf yang bermakna (bukan hanya simbol/emoji saja).
 */
export function hasMeaningfulText(input) {
  if (typeof input !== "string") return false;
  return /[a-zA-ZÀ-ÿ]{2,}/.test(input);
}

/**
 * Sanitasi kata kunci pencarian dari karakter berbahaya (mencegah XSS, SQLi, ekspresi regex jahat, dan emoji).
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== "string") return "";
  return stripEmojis(query)
    .replace(/[<>'";\\`$={}[\]()]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 80);
}

/**
 * Sanitasi tautan gambar (mencegah javascript: URI, tag inject, atau protocol berbahaya).
 */
export function sanitizeImageUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) {
    return "";
  }
  return trimmed.replace(/[<>"'`\s]/g, "").slice(0, 500);
}

/**
 * Sanitasi bio / moto pribadi pengguna (tanpa tag HTML, tanpa leading space, maksimal 200 karakter).
 */
export function sanitizeBio(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<[^>]*>?/gm, "")
    .replace(/^\s+/, "")
    .replace(/[^\S\r\n]{2,}/g, " ")
    .slice(0, 200);
}

/**
 * Sanitasi alamat lengkap domisili (tanpa tag HTML, tanpa leading space, maksimal 250 karakter).
 */
export function sanitizeAddress(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<[^>]*>?/gm, "")
    .replace(/^\s+/, "")
    .replace(/[^\S\r\n]{2,}/g, " ")
    .slice(0, 250);
}

/**
 * Sanitasi teks standar formulir (menghapus HTML, emoji, leading spaces, serta mengompresi spasi ganda).
 */
export function sanitizeStandardText(input, maxLength = 250) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/<[^>]*>?/gm, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, maxLength);
}

/**
 * Sanitasi input digit murni (hanya angka 0-9, mencegah seluruh karakter huruf dan simbol).
 */
export function sanitizeDigitsOnly(input, maxLength = 30) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\D/g, "").slice(0, maxLength);
}

/**
 * Sanitasi nomor NPWP (hanya angka numerik dan pemisah titik/strip resmi).
 */
export function sanitizeNPWP(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/[^\d.-]/g, "")
    .replace(/^\s+/, "")
    .slice(0, 25);
}

/**
 * Sanitasi nomor WhatsApp resmi (hanya tanda '+' di awal, angka, spasi, dan tanda minus; dilarang huruf).
 */
export function sanitizeWhatsAppNumber(input) {
  if (typeof input !== "string") return "";
  const cleaned = stripEmojis(input).replace(/[^\d+\-\s]/g, "");
  // Pastikan '+' hanya boleh di index ke-0
  const hasPlus = cleaned.startsWith("+");
  const withoutPlus = cleaned.replace(/\+/g, "");
  const result = (hasPlus ? "+" : "") + withoutPlus;
  return result.replace(/\s{2,}/g, " ").slice(0, 20);
}

/**
 * Sanitasi nomor telepon kabel / kantor (hanya angka, tanda kurung, spasi, dan tanda minus; dilarang huruf).
 */
export function sanitizeLandlinePhone(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .replace(/[^\d\s\-()]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 25);
}

/**
 * Sanitasi slug URL (hanya huruf kecil, angka, dan strip; tanpa spasi atau karakter asing).
 */
export function sanitizeSlug(input, maxLength = 60) {
  if (typeof input !== "string") return "";
  return stripEmojis(input)
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, maxLength);
}


