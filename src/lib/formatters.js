export function formatRupiah(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

export function formatCompactRupiah(amount, maxDecimals = 1) {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) {
    const val = abs / 1_000_000_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} Triliun`;
  }

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} Miliar`;
  }

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} Juta`;
  }

  if (abs >= 1_000) {
    const val = abs / 1_000;
    const formatted = val.toLocaleString("id-ID", {
      maximumFractionDigits: maxDecimals,
    });
    return `${sign}Rp ${formatted} Ribu`;
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
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isCampaignClosed(campaign) {
  if (!campaign) return false;
  if (campaign.status === "CLOSED" || campaign.status === "COMPLETED") return true;
  if (campaign.endDate) {
    const days = calculateDaysLeft(campaign.endDate);
    if (days !== null && days <= 0) return true;
  }
  return false;
}

export function formatCompactNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000_000) {
    const val = num / 1_000_000_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(1))} T`;
  }
  if (abs >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(1))} M`;
  }
  if (abs >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(1))} Jt`;
  }
  if (abs >= 1_000) {
    const val = num / 1_000;
    return `${val % 1 === 0 ? val : Number(val.toFixed(1))} rb`;
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


