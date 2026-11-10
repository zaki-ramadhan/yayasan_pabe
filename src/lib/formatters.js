export function formatRupiah(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

export function formatCompactRupiah(amount, maxDecimals = 1, options = {}) {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const isShort = options?.short === true;

  if (abs >= 1_000_000_000_000) {
    const val = abs / 1_000_000_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} ${isShort ? "T" : "Triliun"}`;
  }

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} ${isShort ? "M" : "Miliar"}`;
  }

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} ${isShort ? "Jt" : "Juta"}`;
  }

  if (abs >= 1_000) {
    const val = abs / 1_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} ${isShort ? "rb" : "Ribu"}`;
  }

  return formatRupiah(amount);
}

export function getCompactRupiahParts(amount, maxDecimals = 1) {
  if (typeof amount !== "number" || isNaN(amount) || amount === 0) {
    return { value: 0, unit: "", prefix: "Rp ", decimals: 0, fullFormatted: "Rp 0" };
  }

  const abs = Math.abs(amount);

  if (abs >= 1_000_000_000_000) {
    const val = Number((abs / 1_000_000_000_000).toFixed(maxDecimals));
    return {
      value: val,
      unit: " Triliun",
      prefix: "Rp ",
      decimals: val % 1 !== 0 ? maxDecimals : 0,
      fullFormatted: formatRupiah(amount),
    };
  }

  if (abs >= 1_000_000_000) {
    const val = Number((abs / 1_000_000_000).toFixed(maxDecimals));
    return {
      value: val,
      unit: " Miliar",
      prefix: "Rp ",
      decimals: val % 1 !== 0 ? maxDecimals : 0,
      fullFormatted: formatRupiah(amount),
    };
  }

  if (abs >= 1_000_000) {
    const val = Number((abs / 1_000_000).toFixed(maxDecimals));
    return {
      value: val,
      unit: " Juta",
      prefix: "Rp ",
      decimals: val % 1 !== 0 ? maxDecimals : 0,
      fullFormatted: formatRupiah(amount),
    };
  }

  if (abs >= 1_000) {
    const val = Number((abs / 1_000).toFixed(maxDecimals));
    return {
      value: val,
      unit: " Ribu",
      prefix: "Rp ",
      decimals: val % 1 !== 0 ? maxDecimals : 0,
      fullFormatted: formatRupiah(amount),
    };
  }

  return {
    value: amount,
    unit: "",
    prefix: "Rp ",
    decimals: 0,
    fullFormatted: formatRupiah(amount),
  };
}

export function formatNumber(number) {
  if (typeof number !== "number" || isNaN(number)) return "0";
  return new Intl.NumberFormat("id-ID").format(number);
}

const ID_DAYS = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const ID_MONTHS_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const {
    month = "short",
    withTime = false,
    withDay = false,
    withSeconds = false,
  } = options;

  // Convert consistently to WIB (UTC+7)
  const wibTime = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const dayName = ID_DAYS[wibTime.getDay()];
  const day = wibTime.getDate();
  const monthIdx = wibTime.getMonth();
  const year = wibTime.getFullYear();

  const monthName = month === "long" ? ID_MONTHS_LONG[monthIdx] : ID_MONTHS_SHORT[monthIdx];
  let formatted = `${day} ${monthName} ${year}`;

  if (withDay) {
    formatted = `${dayName}, ${formatted}`;
  }

  if (withTime) {
    const hours = String(wibTime.getHours()).padStart(2, "0");
    const minutes = String(wibTime.getMinutes()).padStart(2, "0");
    if (withSeconds) {
      const seconds = String(wibTime.getSeconds()).padStart(2, "0");
      formatted += `, ${hours}:${minutes}:${seconds} WIB`;
    } else {
      formatted += `, ${hours}:${minutes} WIB`;
    }
  }

  return formatted;
}

/**
 * Memformat waktu WIB dalam format "HH:mm WIB" atau "HH:mm:ss WIB"
 * @param {string | Date | null} dateInput
 * @param {{ withSeconds?: boolean }} [options]
 * @returns {string}
 */
export function formatTime(dateInput, options = {}) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const { withSeconds = false } = options;
  const wibTime = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const hours = String(wibTime.getHours()).padStart(2, "0");
  const minutes = String(wibTime.getMinutes()).padStart(2, "0");

  if (withSeconds) {
    const seconds = String(wibTime.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds} WIB`;
  }
  return `${hours}:${minutes} WIB`;
}

/**
 * Memformat rentang tanggal secara ringkas dan humanis:
 * - Sama hari: "5 Nov 2026"
 * - Sama bulan & tahun: "5 - 20 Nov 2026"
 * - Beda bulan, sama tahun: "5 Nov - 10 Des 2026"
 * - Beda tahun: "5 Nov 2026 - 10 Jan 2027"
 * - Tanpa batas akhir: "Mulai 5 Nov 2026"
 *
 * @param {string | Date | null} startDateInput
 * @param {string | Date | null} [endDateInput]
 * @param {{ month?: "short" | "long" }} [options]
 * @returns {string}
 */
export function formatDateRange(startDateInput, endDateInput, options = {}) {
  const { month = "short" } = options;

  const parseSafe = (input) => {
    if (!input) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === "string") {
      const trimmed = input.trim();
      if (!trimmed) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return isNaN(dateObj.getTime()) ? null : dateObj;
      }
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const start = parseSafe(startDateInput);
  const end = parseSafe(endDateInput);

  if (!start && !end) return "-";

  const getMonthName = (date) =>
    month === "long" ? ID_MONTHS_LONG[date.getMonth()] : ID_MONTHS_SHORT[date.getMonth()];

  if (start && !end) {
    return `Mulai ${start.getDate()} ${getMonthName(start)} ${start.getFullYear()}`;
  }

  if (!start && end) {
    return `s/d ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
  }

  const sDay = start.getDate();
  const sMonth = start.getMonth();
  const sYear = start.getFullYear();

  const eDay = end.getDate();
  const eMonth = end.getMonth();
  const eYear = end.getFullYear();

  // Sama persis
  if (sDay === eDay && sMonth === eMonth && sYear === eYear) {
    return `${sDay} ${getMonthName(start)} ${sYear}`;
  }

  // Sama bulan dan tahun
  if (sMonth === eMonth && sYear === eYear) {
    return `${sDay} - ${eDay} ${getMonthName(start)} ${sYear}`;
  }

  // Beda bulan, sama tahun
  if (sYear === eYear) {
    return `${sDay} ${getMonthName(start)} - ${eDay} ${getMonthName(end)} ${sYear}`;
  }

  // Beda tahun
  return `${sDay} ${getMonthName(start)} ${sYear} - ${eDay} ${getMonthName(end)} ${eYear}`;
}

const ID_MONTH_ABBR_MAP = {
  januari: "Jan",
  februari: "Feb",
  maret: "Mar",
  april: "Apr",
  mei: "Mei",
  juni: "Jun",
  juli: "Jul",
  agustus: "Agu",
  september: "Sep",
  oktober: "Okt",
  november: "Nov",
  desember: "Des",
};

/**
 * Format tanggal batas lamaran karier.
 * Jika berformat ISO string (YYYY-MM-DD), akan di-format ke bahasa Indonesia (contoh: 30 Nov 2026).
 * Jika string teks deskripsi biasa (contoh: "30 Oktober 2026"), nama bulan disingkat jika opsi month="short".
 */
export function formatDeadlineDate(dateInput, options = {}) {
  const { month = "short" } = options;
  if (!dateInput) return "-";
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return "-";
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const formatted = formatDate(trimmed, { month });
      if (formatted !== "-") return formatted;
    }
    if (month === "short") {
      let abbreviated = trimmed;
      for (const [full, short] of Object.entries(ID_MONTH_ABBR_MAP)) {
        const regex = new RegExp(`\\b${full}\\b`, "gi");
        if (regex.test(abbreviated)) {
          abbreviated = abbreviated.replace(regex, short);
        }
      }
      return abbreviated;
    }
    return trimmed;
  }
  return formatDate(dateInput, { month });
}

export function formatHumanRelativeDate(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay <= 7) return `${diffDay} hari yang lalu`;

  // Lewat dari 7 hari: gunakan format tanggal kalender absolut
  return formatDate(date, { month: "short" });
}

export function calculateProgress(collectedAmount, targetAmount) {
  if (!targetAmount || targetAmount <= 0) return 0;
  const percentage = (collectedAmount / targetAmount) * 100;
  return Math.round(percentage);
}

export function calculateDaysLeft(endDateInput) {
  if (!endDateInput) return null;
  const targetDate = new Date(endDateInput);
  if (isNaN(targetDate.getTime())) return null;

  // Jika format input adalah YYYY-MM-DD tanpa waktu, set ke akhir hari
  if (typeof endDateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(endDateInput.trim())) {
    targetDate.setHours(23, 59, 59, 999);
  }

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  if (diffTime <= 0) return 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isCampaignClosed(campaign) {
  if (!campaign) return false;
  if (campaign.status === "CLOSED" || campaign.status === "COMPLETED") return true;
  if (campaign.endDate) {
    const targetDate = new Date(campaign.endDate);
    if (!isNaN(targetDate.getTime())) {
      if (typeof campaign.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(campaign.endDate.trim())) {
        targetDate.setHours(23, 59, 59, 999);
      }
      if (targetDate.getTime() < Date.now()) return true;
    }
  }
  return false;
}

export function formatCompactNumber(num, maxDecimals = 1) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000_000) {
    const val = num / 1_000_000_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(maxDecimals))} T`;
  }
  if (abs >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(maxDecimals))} M`;
  }
  if (abs >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(maxDecimals))} Jt`;
  }
  if (abs >= 1_000) {
    const val = num / 1_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(maxDecimals))} rb`;
  }
  return String(num);
}

/**
 * Formats a raw numeric string with 3-digit dot thousand separator (e.g. 10000 -> 10.000)
 * Sanitizes leading zeros, spaces, and non-digit characters.
 * @param {string|number} value
 * @returns {string}
 */
export function formatThousandsInput(value) {
  if (value === null || value === undefined || value === "") return "";
  const cleaned = String(value).replace(/\D/g, "");
  if (!cleaned) return "";
  const integer = parseInt(cleaned, 10);
  if (isNaN(integer)) return "";
  return new Intl.NumberFormat("id-ID").format(integer);
}

/**
 * Parses a thousand-separated string back to a clean primitive integer.
 * @param {string|number} value
 * @returns {number}
 */
export function parseThousandsToNumber(value) {
  if (typeof value === "number") return isNaN(value) ? 0 : Math.round(value);
  if (!value || typeof value !== "string") return 0;
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}
export { maskEmail } from "@/lib/security";
export { formatRupiah as formatCurrency };
export { formatClockTime } from "./dateUtils";

/**
 * Mendekode entitas HTML umum seperti &amp; menjadi & agar tampil bersih di UI.
 * @param {string} str
 * @returns {string}
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

/**
 * Menghasilkan inisial 2 karakter untuk avatar/PFP secara proporsional:
 * - Jika terdiri dari >= 2 kata: ambil huruf pertama kata ke-1 + huruf pertama kata ke-2 (e.g. "Hendra Wijaya" -> "HW").
 * - Jika hanya 1 kata: ambil 2 huruf pertama dari kata tersebut (e.g. "Zaki" -> "ZA", "Budi" -> "BU").
 * - Jika nama kosong, gunakan email atau fallback default (e.g. "D" atau "U").
 * @param {string} name
 * @param {string} [fallbackOrEmail]
 * @returns {string}
 */
export function getInitials(name, fallbackOrEmail = "U") {
  if (name && typeof name === "string") {
    const cleaned = name.trim().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
    if (cleaned) {
      const parts = cleaned.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
    }
  }

  if (fallbackOrEmail && typeof fallbackOrEmail === "string") {
    const cleanFallback = fallbackOrEmail.trim().replace(/[^\p{L}\p{N}]/gu, "");
    if (cleanFallback.length >= 2) {
      return cleanFallback.slice(0, 2).toUpperCase();
    }
    if (cleanFallback.length === 1) {
      return cleanFallback.toUpperCase();
    }
  }

  return "U";
}

/**
 * Mengubah string menjadi format Title Case yang rapi (contoh: "PENDIDIKAN ISLAM" -> "Pendidikan Islam").
 * Menjaga kata penghubung kecil tetap lowercase jika bukan kata pertama.
 */
export function toTitleCase(str) {
  if (!str || typeof str !== "string") return "";
  const smallWords = new Set(["dan", "atau", "di", "ke", "dari", "untuk", "pada", "yang", "&"]);
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      if (idx > 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Format nama metode pembayaran agar ramah pengguna dan tidak menampilkan kode mentah bersambung underscore.
 * @param {string} channel
 * @returns {string}
 */
export function formatPaymentChannel(channel) {
  if (!channel || typeof channel !== "string") return "-";
  const clean = channel.trim().toLowerCase();

  const channelMap = {
    qris: "QRIS",
    bri_va: "BRI Virtual Account",
    mandiri_va: "Mandiri Virtual Account",
    bca_va: "BCA Virtual Account",
    bni_va: "BNI Virtual Account",
    bsi_va: "BSI Virtual Account",
    cimb_va: "CIMB Virtual Account",
    danamon_va: "Danamon Virtual Account",
    permata_va: "Permata Virtual Account",
    bank_mandiri: "Bank Mandiri",
    bank_bri: "Bank BRI",
    bank_bca: "Bank BCA",
    bank_bni: "Bank BNI",
    bank_bsi: "Bank BSI",
    bank_dki: "Bank DKI",
    mandiri: "Bank Mandiri",
    bri: "Bank BRI",
    bca: "Bank BCA",
    bni: "Bank BNI",
    bsi: "Bank BSI",
    gopay: "GoPay",
    ovo: "OVO",
    dana: "DANA",
    shopeepay: "ShopeePay",
    linkaja: "LinkAja",
    transfer_manual: "Transfer Manual",
    cash: "Tunai / Kas Yayasan",
  };

  if (channelMap[clean]) return channelMap[clean];

  return clean
    .split("_")
    .map((part) => {
      const u = part.toUpperCase();
      if (["BRI", "BCA", "BNI", "BSI", "VA", "QRIS", "DKI", "ATM"].includes(u)) return u;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

/**
 * Format ukuran byte menjadi satuan yang mudah dibaca (B, KB, MB, GB).
 *
 * @param {number} bytes
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format durasi detik menjadi format menit:detik (contoh: 65 -> "1:05").
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

