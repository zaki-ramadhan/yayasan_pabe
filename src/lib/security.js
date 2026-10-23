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
    .replace(/[&<>"']/g, (match) => {
      const escapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return escapeMap[match] || match;
    })
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
 * Dilarang keras memuat emoji, angka, tag HTML, atau leading space.
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
 * Validasi konsistensi data rekening bank.
 * Jika salah satu diisi (nomor atau nama), maka keduanya wajib valid dan terisi.
 */
export function validateBankAccount({ bankAccount, bankAccountName } = {}) {
  const cleanAccount = sanitizeBankAccount(bankAccount || "");
  const cleanAccountName = sanitizeBankAccountName(bankAccountName || "").trim();

  // Jika keduanya kosong, diperbolehkan (data rekening bersifat opsional)
  if (!cleanAccount && !cleanAccountName) {
    return { isValid: true, valid: true, message: "", error: "" };
  }

  if (!cleanAccount) {
    const msg = "Nomor rekening wajib diisi jika atas nama rekening dicantumkan.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (cleanAccount.length < 5) {
    const msg = "Nomor rekening bank minimal 5 digit angka.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (!cleanAccountName) {
    const msg = "Atas nama rekening wajib diisi sesuai buku tabungan jika nomor rekening dicantumkan.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (cleanAccountName.length < 2) {
    const msg = "Atas nama rekening minimal 2 karakter huruf.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  return { isValid: true, valid: true, message: "", error: "" };
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
 * Validasi kekuatan dasar kata sandi.
 */
export function validatePasswordInput(password, fieldLabel = "Kata sandi") {
  if (!password || typeof password !== "string" || !password.trim()) {
    const msg = `${fieldLabel} tidak boleh kosong.`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (password.length < 6) {
    const msg = `${fieldLabel} minimal 6 karakter.`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (password.length > 128) {
    const msg = `${fieldLabel} maksimal 128 karakter.`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  return { isValid: true, valid: true, message: "", error: "" };
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
 * Daftar kata kunci terlarang dan dicadangkan oleh sistem (Anti-Impersonation).
 */
export const RESERVED_KEYWORDS = [
  // 1. Otoritas Sistem & Teknis
  "admin",
  "administrator",
  "superadmin",
  "root",
  "system",
  "sysadmin",
  "moderator",
  "mod",
  "developer",
  "webmaster",

  // 2. Identitas Yayasan & Staf Resmi
  "yayasan",
  "pabe",
  "ygsm",
  "official",
  "staff",
  "pengurus",
  "civitas",
  "helpdesk",
  "support",
  "customerservice",
  "cs",

  // 3. Entitas Finansial & Otoritas
  "bendahara",
  "auditor",
  "finance",
  "keuangan",
  "kasir",
  "bank",
];

/**
 * Normalisasi leetspeak dan substitusi karakter visual (anti-evasion).
 */
export function normalizeLeetspeak(input) {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/[$5]/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b");
}

/**
 * Memeriksa apakah teks memuat kata-kata yang dicadangkan sistem atau indikasi penyamaran.
 */
export function containsReservedKeyword(input) {
  if (typeof input !== "string" || !input.trim()) {
    return { isReserved: false, matchedWord: null };
  }

  const normalized = normalizeLeetspeak(input);

  // Ekstrak token kata individual (pemisah spasi, titik, underscore, strip, koma, dsb)
  const tokens = normalized.split(/[^a-z0-9]+/i).filter(Boolean);

  // Deteksi jika pengguna mengetik huruf per huruf dengan pemisah (contoh: 'a d m i n' atau 'a_d_m_i_n')
  const isSpacedOut = tokens.length >= 3 && tokens.every((t) => t.length <= 2);
  const spacedOutWord = isSpacedOut ? tokens.join("") : "";

  for (const keyword of RESERVED_KEYWORDS) {
    // 1. Kecocokan token persis kata utuh
    if (tokens.includes(keyword)) {
      return { isReserved: true, matchedWord: keyword };
    }

    // 2. Deteksi prefiks/sufiks untuk istilah sensitif sistem
    if (["admin", "administrator", "superadmin", "yayasan", "pabe", "ygsm", "official"].includes(keyword)) {
      for (const token of tokens) {
        if (
          token === keyword ||
          token.startsWith(keyword) ||
          token.endsWith(keyword)
        ) {
          return { isReserved: true, matchedWord: keyword };
        }
      }

      if (spacedOutWord && (spacedOutWord === keyword || spacedOutWord.includes(keyword))) {
        return { isReserved: true, matchedWord: keyword };
      }
    }
  }

  return { isReserved: false, matchedWord: null };
}

/**
 * Validasi nama lengkap dengan proteksi anti-penyamaran identitas.
 */
export function validateName(name, isAnonymous = false) {
  if (isAnonymous) {
    return { isValid: true, valid: true, message: "", error: "", sanitized: "Hamba Allah" };
  }
  const clean = sanitizeName(name).trim();
  if (!clean || clean.length < 2) {
    const msg = "Nama lengkap minimal 2 karakter dan hanya boleh berisi huruf serta tanda baca gelar/nama wajar.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (clean.length > 60) {
    const msg = "Nama lengkap maksimal 60 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // Proteksi anti-impersonation kata dicadangkan
  const reservedCheck = containsReservedKeyword(clean);
  if (reservedCheck.isReserved) {
    const msg = `Nama tidak boleh menggunakan kata yang dicadangkan sistem atau identitas resmi yayasan ("${reservedCheck.matchedWord}").`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  return { isValid: true, valid: true, message: "", error: "", sanitized: clean };
}

/**
 * Validasi nama pengguna (username) saat pendaftaran akun.
 */
export function validateUsername(username) {
  if (typeof username !== "string") {
    const msg = "Nama pengguna wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const clean = stripEmojis(username).trim();

  if (!clean) {
    const msg = "Nama pengguna wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (clean.length < 3) {
    const msg = "Nama pengguna minimal 3 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (clean.length > 30) {
    const msg = "Nama pengguna maksimal 30 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (!/^[a-zA-Z0-9_.]+$/.test(clean)) {
    const msg = "Nama pengguna hanya boleh berisi huruf, angka, titik, atau garis bawah.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // Proteksi anti-impersonation username
  const reservedCheck = containsReservedKeyword(clean);
  if (reservedCheck.isReserved) {
    const msg = `Nama pengguna tidak boleh mengandung istilah yang dicadangkan sistem ("${reservedCheck.matchedWord}").`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  return {
    isValid: true,
    valid: true,
    message: "",
    error: "",
    sanitized: clean.toLowerCase(),
  };
}

/**
 * Sanitasi nomor HP/WhatsApp (hanya angka digit, maksimal 15 digit).
 */
export function sanitizePhone(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\D/g, "").slice(0, 15);
}

/**
 * Validasi nomor HP/WhatsApp Indonesia (diawali 08 atau 628, panjang 10-14 digit).
 */
export function validatePhone(phone) {
  const digits = sanitizePhone(phone);
  if (!digits) {
    const msg = "Nomor WhatsApp aktif wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  // Format nomor seluler Indonesia: diawali 08 atau 628 dengan digit ke-3 dari 1-9
  const isIndonesianFormat = /^(08|628)[1-9][0-9]{7,12}$/.test(digits);
  if (!isIndonesianFormat) {
    const msg = "Nomor WhatsApp tidak valid. Masukkan nomor seluler Indonesia yang aktif (contoh: 08123456789, 10-14 digit).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  return { isValid: true, valid: true, message: "", error: "", sanitized: digits };
}

/**
 * Sanitasi alamat email (tanpa spasi, tanpa emoji, lowercase, maksimal 100 karakter).
 */
export function sanitizeEmail(input) {
  if (typeof input !== "string") return "";
  return stripEmojis(input).replace(/\s/g, "").slice(0, 100);
}

/**
 * Validasi alamat email standar.
 */
export function validateEmail(email, isRequired = false) {
  const clean = sanitizeEmail(email).trim().toLowerCase();
  if (!clean) {
    if (isRequired) {
      const msg = "Alamat email wajib diisi.";
      return { isValid: false, valid: false, message: msg, error: msg };
    }
    return { isValid: true, valid: true, message: "", error: "", sanitized: "" };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    const msg = "Format alamat email tidak valid (contoh: nama@email.com).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  return { isValid: true, valid: true, message: "", error: "", sanitized: clean };
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

export const PRAYER_LIMITS = {
  MIN_LENGTH: 5,
  MAX_LENGTH: 150,
};

/**
 * Menghitung jumlah karakter visual nyata (Grapheme Cluster).
 * Memastikan 1 emoji (termasuk emoji majemuk / bertanda) tepat dihitung sebagai 1 karakter.
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
 * Validasi doa atau pesan donatur (minimal 5 karakter visual, wajib ada kata/kalimat, maksimal 150 karakter).
 */
export function validatePrayer(prayer, isRequired = false, minLength = PRAYER_LIMITS.MIN_LENGTH, maxLength = PRAYER_LIMITS.MAX_LENGTH) {
  const clean = sanitizePrayer(prayer).trim();
  if (!clean) {
    if (isRequired) {
      const msg = "Untaian doa kebaikan wajib diisi.";
      return { isValid: false, valid: false, message: msg, error: msg, sanitized: "" };
    }
    return { isValid: true, valid: true, message: "", error: "", sanitized: "" };
  }
  const visualLength = countGraphemes(clean);
  if (visualLength < minLength) {
    const msg = `Untaian doa minimal ${minLength} karakter agar bermakna (contoh: "Semoga berkah & lekas sembuh").`;
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean };
  }
  if (!hasMeaningfulText(clean)) {
    const msg = "Untaian doa wajib mengandung kata atau kalimat doa, bukan hanya deretan emoji atau simbol.";
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean };
  }
  if (visualLength > maxLength) {
    const msg = `Untaian doa maksimal ${maxLength} karakter.`;
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean.slice(0, maxLength) };
  }
  return { isValid: true, valid: true, message: "", error: "", sanitized: clean };
}

export function generateIdempotencyKey() {
  return "idemp_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

export const DONATION_LIMITS = {
  MIN_AMOUNT: 10000,
  MAX_AMOUNT: 100000000,
};

export function validateDonationAmount(amount) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount < DONATION_LIMITS.MIN_AMOUNT) {
    return {
      isValid: false,
      message: `Nominal donasi minimal Rp ${new Intl.NumberFormat("id-ID").format(DONATION_LIMITS.MIN_AMOUNT)}`,
    };
  }
  if (numericAmount > DONATION_LIMITS.MAX_AMOUNT) {
    return {
      isValid: false,
      message: `Nominal donasi maksimal Rp ${new Intl.NumberFormat("id-ID").format(DONATION_LIMITS.MAX_AMOUNT)}`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Sensor email untuk tampilan publik (contoh: budisantoso@gmail.com -> bu***so@gmail.com).
 * Mempertahankan domain agar tetap kredibel dan transparan bagi publik.
 */
export function maskEmail(email) {
  if (!email || typeof email !== "string") return "-";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex === -1) return trimmed;

  const user = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!domain) return trimmed;

  if (user.length <= 2) {
    return `${user[0] || "*"}***@${domain}`;
  }
  if (user.length <= 4) {
    return `${user.slice(0, 1)}***${user.slice(-1)}@${domain}`;
  }
  return `${user.slice(0, 2)}***${user.slice(-2)}@${domain}`;
}

/**
 * Sensor nomor HP/WhatsApp untuk privasi publik (contoh: 081234567890 -> 0812-****-7890).
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return digits;
  return `${digits.slice(0, 4)}-****-${digits.slice(-4)}`;
}

/**
 * Sanitasi kata kunci pencarian dari karakter berbahaya (mencegah XSS, SQLi, ekspresi regex jahat, dan emoji).
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== "string") return "";
  return stripEmojis(query)
    .replace(/[<>'";\\`$={}[\]()]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 80);
}

