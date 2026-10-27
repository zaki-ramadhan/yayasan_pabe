import {
  stripEmojis,
  sanitizeName,
  sanitizeBankAccount,
  sanitizeBankAccountName,
  sanitizePhone,
  sanitizeEmail,
  sanitizePrayer,
  countGraphemes,
  hasMeaningfulText,
} from "./sanitizer";

export const RESERVED_KEYWORDS = [
  "admin",
  "administrator",
  "superadmin",
  "yayasan",
  "pabe",
  "payungberkah",
  "ypabe",
  "official",
  "pengurus",
  "civitas",
  "helpdesk",
  "support",
  "customerservice",
  "cs",
  "bendahara",
  "auditor",
  "finance",
  "keuangan",
  "kasir",
  "bank",
];

export const PRAYER_LIMITS = {
  MIN_LENGTH: 5,
  MAX_LENGTH: 150,
};

export const DONATION_LIMITS = {
  MIN_AMOUNT: 10000,
  MAX_AMOUNT: 100000000,
};

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
  const tokens = normalized.split(/[^a-z0-9]+/i).filter(Boolean);
  const isSpacedOut = tokens.length >= 3 && tokens.every((t) => t.length <= 2);
  const spacedOutWord = isSpacedOut ? tokens.join("") : "";

  for (const keyword of RESERVED_KEYWORDS) {
    if (tokens.includes(keyword)) {
      return { isReserved: true, matchedWord: keyword };
    }

    if (["admin", "administrator", "superadmin", "yayasan", "pabe", "ypabe", "payungberkah", "official"].includes(keyword)) {
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
 * Validasi konsistensi data rekening bank.
 */
export function validateBankAccount({ bankAccount, bankAccountName } = {}) {
  const cleanAccount = sanitizeBankAccount(bankAccount || "");
  const cleanAccountName = sanitizeBankAccountName(bankAccountName || "").trim();

  if (!cleanAccount && !cleanAccountName) {
    return { isValid: true, valid: true, message: "", error: "" };
  }

  if (!cleanAccount) {
    const msg = "Nomor rekening wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (cleanAccount.length < 5 || cleanAccount.length > 30) {
    const msg = "Nomor rekening harus 5-30 digit angka.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (!cleanAccountName) {
    const msg = "Nama pemilik rekening wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (cleanAccountName.length < 2) {
    const msg = "Nama pemilik rekening minimal 2 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  return {
    isValid: true,
    valid: true,
    message: "",
    error: "",
    sanitized: { bankAccount: cleanAccount, bankAccountName: cleanAccountName },
  };
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
    const msg = "Nama lengkap minimal 2 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (clean.length > 60) {
    const msg = "Nama lengkap maksimal 60 karakter.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const reservedCheck = containsReservedKeyword(clean);
  if (reservedCheck.isReserved) {
    const msg = `Nama tidak boleh menggunakan nama resmi yayasan ("${reservedCheck.matchedWord}").`;
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
    const msg = "Hanya boleh huruf, angka, titik, atau garis bawah.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const reservedCheck = containsReservedKeyword(clean);
  if (reservedCheck.isReserved) {
    const msg = `Nama pengguna tidak boleh memakai kata "${reservedCheck.matchedWord}".`;
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
 * Validasi nomor HP/WhatsApp Indonesia (diawali 08 atau 628, panjang 10-14 digit).
 */
export function validatePhone(phone) {
  const digits = sanitizePhone(phone);
  if (!digits) {
    const msg = "Nomor WhatsApp wajib diisi.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  const isIndonesianFormat = /^(08|628)[1-9][0-9]{7,12}$/.test(digits);
  if (!isIndonesianFormat) {
    const msg = "Nomor tidak valid (contoh: 08123456789).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  return { isValid: true, valid: true, message: "", error: "", sanitized: digits };
}

// Daftar domain typo umum untuk proteksi salah ketik pengguna
const COMMON_TYPO_DOMAINS = {
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

/**
 * Validasi alamat email standar dengan verifikasi sintaksis domain dan proteksi typo.
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

  // 1. Batasan panjang standar
  if (clean.length < 5 || clean.length > 254) {
    const msg = "Format email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 2. Pemisahan karakter @ tepat satu
  const atParts = clean.split("@");
  if (atParts.length !== 2) {
    const msg = "Format email tidak valid (contoh: nama@email.com).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const [localPart, domainPart] = atParts;

  // 3. Validasi Local Part (sebelum @)
  if (!localPart || localPart.length > 64) {
    const msg = "Format email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    const msg = "Format email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const localRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
  if (!localRegex.test(localPart)) {
    const msg = "Karakter nama email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 4. Validasi Domain Part (setelah @)
  if (!domainPart || domainPart.length > 253) {
    const msg = "Domain email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (!domainPart.includes(".")) {
    const msg = "Domain belum lengkap (contoh: @gmail.com).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  if (domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.includes("..")) {
    const msg = "Domain email tidak valid.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  const domainLabels = domainPart.split(".");
  for (let i = 0; i < domainLabels.length; i++) {
    const label = domainLabels[i];
    if (!label || label.length > 63 || label.startsWith("-") || label.endsWith("-") || !/^[a-zA-Z0-9-]+$/.test(label)) {
      const msg = "Domain email tidak valid.";
      return { isValid: false, valid: false, message: msg, error: msg };
    }
  }

  // TLD (label terakhir) wajib minimal 2 karakter alfabet
  const tld = domainLabels[domainLabels.length - 1];
  if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
    const msg = "Ekstensi email tidak valid (contoh: .com, .id).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 5. Proteksi Typo Domain Populer
  if (COMMON_TYPO_DOMAINS[domainPart]) {
    const suggested = COMMON_TYPO_DOMAINS[domainPart];
    const msg = `Mungkin maksud Anda "${localPart}@${suggested}"?`;
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  return { isValid: true, valid: true, message: "", error: "", sanitized: clean, domain: domainPart };
}

/**
 * Validasi doa atau pesan donatur
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
    const msg = `Doa minimal ${minLength} karakter.`;
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean };
  }
  if (!hasMeaningfulText(clean)) {
    const msg = "Sertakan kalimat doa, bukan hanya emoji atau simbol.";
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean };
  }
  if (visualLength > maxLength) {
    const msg = `Doa maksimal ${maxLength} karakter.`;
    return { isValid: false, valid: false, message: msg, error: msg, sanitized: clean.slice(0, maxLength) };
  }
  return { isValid: true, valid: true, message: "", error: "", sanitized: clean };
}

/**
 * Validasi nominal donasi dengan batas minimal dan maksimal
 */
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
 * Validasi formulir pengaturan yayasan dan rekening bank resmi.
 */
export function validateOrgSettings(formData) {
  const errors = {};
  if (!formData || typeof formData !== "object") {
    return { isValid: false, error: "Data pengaturan yayasan tidak valid.", errors: { _global: "Data pengaturan yayasan tidak valid." } };
  }

  // 1. Identitas
  const name = (formData.name || "").trim();
  if (!name || name.length < 3) {
    errors.name = "Nama resmi yayasan minimal 3 karakter.";
  }

  const shortName = (formData.shortName || "").trim();
  if (!shortName || shortName.length < 2) {
    errors.shortName = "Singkatan nama yayasan minimal 2 karakter.";
  }

  // 2. Kontak
  const email = (formData.contacts?.email || "").trim();
  if (email) {
    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      errors.email = emailCheck.message;
    }
  }

  const whatsapp = (formData.contacts?.whatsapp || "").trim();
  if (whatsapp) {
    const digitsOnly = whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      errors.whatsapp = "Nomor WhatsApp harus 8-15 digit angka.";
    }
  }

  const phone = (formData.contacts?.phone || "").trim();
  if (phone) {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 6 || digitsOnly.length > 15) {
      errors.phone = "Nomor telepon harus 6-15 digit angka.";
    }
  }

  // 3. Rekening Bank
  if (Array.isArray(formData.officialBankAccounts)) {
    for (let i = 0; i < formData.officialBankAccounts.length; i++) {
      const acc = formData.officialBankAccounts[i];
      const bankName = (acc.bank || "").trim();
      const accNum = (acc.accountNumber || "").trim().replace(/\D/g, "");
      const accHolder = (acc.accountName || "").trim();

      if (!bankName && !accNum && !accHolder) {
        errors[`bankAccount_${i}`] = `Lengkapi data rekening ke-${i + 1}.`;
        break;
      }
      if (!bankName) {
        errors[`bankName_${i}`] = "Nama bank wajib diisi.";
      }
      if (!accNum || accNum.length < 5 || accNum.length > 25) {
        errors[`accountNumber_${i}`] = "Nomor rekening harus 5-25 digit angka.";
      }
      if (!accHolder || accHolder.length < 2) {
        errors[`accountName_${i}`] = "Nama pemilik rekening minimal 2 karakter.";
      }
    }
  }

  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    return { isValid: false, error: errors[errorKeys[0]], errors };
  }

  return { isValid: true, error: "", errors: {} };
}

