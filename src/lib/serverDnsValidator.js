import dns from "node:dns/promises";
import { validateEmail } from "./validator";
import {
  TRUSTED_EMAIL_DOMAINS,
  isDisposableEmail,
  isRoleBasedEmail,
} from "./emailConstants";

/**
 * In-memory cache untuk domain DNS status dengan TTL (1 jam).
 * Mengurangi beban network DNS dan membuat response secepat kilat (0 ms) untuk domain umum.
 */
const DNS_CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Jam

for (const d of TRUSTED_EMAIL_DOMAINS) {
  DNS_CACHE.set(d, { isValid: true, timestamp: Date.now() + CACHE_TTL_MS * 24 });
}

/**
 * Verifikasi sintaks email, proteksi disposable, dan validasi keberadaan mail server di DNS.
 *
 * @param {string} email - Alamat email yang diinput pengguna.
 * @param {object} options - Opsi validasi.
 * @param {boolean} [options.isRequired=false] - Apakah email wajib diisi.
 * @param {boolean} [options.allowDisposable=false] - Apakah mengizinkan email sekali pakai.
 * @param {boolean} [options.allowRole=true] - Apakah mengizinkan email peran (info@, admin@).
 * @param {number} [options.timeoutMs=2500] - Batas waktu maksimal query DNS dalam milidetik.
 * @returns {Promise<{ isValid: boolean, valid: boolean, message: string, error: string, sanitized?: string, domain?: string }>}
 */
export async function verifyEmailDomainDns(
  email,
  {
    isRequired = false,
    allowDisposable = false,
    allowRole = true,
    timeoutMs = 2500,
  } = {}
) {
  // 1. Validasi sintaksis dan format domain lokal terlebih dahulu
  const syntaxCheck = validateEmail(email, isRequired);
  if (!syntaxCheck.isValid) {
    return syntaxCheck;
  }

  // Jika opsional dan string kosong, langsung loloskan
  if (!syntaxCheck.sanitized) {
    return syntaxCheck;
  }

  const clean = syntaxCheck.sanitized;
  const parts = clean.split("@");
  const domain = syntaxCheck.domain || parts[1];

  if (!domain) {
    const msg = "Format email tidak valid (contoh: nama@email.com).";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 2. Deteksi email sementara (disposable) via SSOT
  if (!allowDisposable && isDisposableEmail(clean)) {
    const msg = "Email sementara tidak diizinkan. Gunakan email pribadi Anda.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 3. Deteksi email peran (role-based) via SSOT
  if (!allowRole && isRoleBasedEmail(clean)) {
    const msg = "Gunakan email pribadi, bukan email kantor/umum.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 4. Cek in-memory cache
  const cached = DNS_CACHE.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    if (cached.isValid) {
      return syntaxCheck;
    }
    const msg = "Domain email tidak ditemukan. Periksa kembali pengetikannya.";
    return { isValid: false, valid: false, message: msg, error: msg };
  }

  // 5. Query DNS internet dengan timeout guard
  try {
    const hasMx = await queryDnsWithTimeout(domain, timeoutMs);
    DNS_CACHE.set(domain, { isValid: hasMx, timestamp: Date.now() });

    if (!hasMx) {
      const msg = "Domain email tidak ditemukan. Periksa kembali pengetikannya.";
      return { isValid: false, valid: false, message: msg, error: msg };
    }

    return syntaxCheck;
  } catch (error) {
    const errorCode = error?.code;

    // Jika domain secara eksplisit tidak ditemukan di root DNS (domain fiktif / tidak terdaftar)
    if (errorCode === "ENOTFOUND" || errorCode === "ENODATA" || errorCode === "NXDOMAIN") {
      DNS_CACHE.set(domain, { isValid: false, timestamp: Date.now() });
      const msg = "Domain email tidak ditemukan. Periksa kembali pengetikannya.";
      return { isValid: false, valid: false, message: msg, error: msg };
    }

    // Jika terjadi timeout atau kendala jaringan resolver lokal ISP
    // Kebijakan: fail-open dengan log agar transaksi donasi/registrasi tidak macet total
    console.warn(
      `[DNS Verifier] DNS resolution timeout/warning for domain "${domain}":`,
      error.message
    );
    return syntaxCheck;
  }
}

/**
 * Query MX record domain dengan fallback ke A record dan proteksi timeout.
 */
async function queryDnsWithTimeout(domain, timeoutMs) {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        reject(new Error(`DNS resolution timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    // Coba resolve MX record (Mail Exchange)
    dns
      .resolveMx(domain)
      .then((mxRecords) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          if (Array.isArray(mxRecords) && mxRecords.length > 0) {
            resolve(true);
          } else {
            // Jika MX kosong, fallback ke A record (RFC 5321 Section 5)
            resolveFallbackA(domain, resolve, reject);
          }
        }
      })
      .catch((mxErr) => {
        if (!isSettled) {
          // Jika MX record tidak ada (ENODATA), coba periksa A record
          if (mxErr?.code === "ENODATA") {
            resolveFallbackA(domain, resolve, reject, timer);
          } else {
            isSettled = true;
            clearTimeout(timer);
            reject(mxErr);
          }
        }
      });
  });
}

/**
 * Fallback pemeriksaan A record jika domain tidak mengonfigurasi MX record khusus.
 */
function resolveFallbackA(domain, resolve, reject, timer = null) {
  dns
    .resolve4(domain)
    .then((aRecords) => {
      if (timer) clearTimeout(timer);
      resolve(Array.isArray(aRecords) && aRecords.length > 0);
    })
    .catch((aErr) => {
      if (timer) clearTimeout(timer);
      reject(aErr);
    });
}
