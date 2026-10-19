import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/serverAuth";
import {
  stripEmojis,
  sanitizeInput,
  sanitizeName,
  validateName,
} from "@/lib/security";

describe("security - hashPassword & verifyPassword", () => {
  it("melakukan hash password dan memverifikasinya secara valid", () => {
    const rawPassword = "PasswordRahasia123!";
    const hashed = hashPassword(rawPassword);

    expect(hashed).toContain(":");
    expect(verifyPassword(rawPassword, hashed)).toBe(true);
    expect(verifyPassword("PasswordSalah", hashed)).toBe(false);
  });

  it("mengembalikan false jika password atau storedHash kosong", () => {
    expect(verifyPassword("", "salt:hash")).toBe(false);
    expect(verifyPassword("pass", "")).toBe(false);
    expect(verifyPassword(null, null)).toBe(false);
  });
});

describe("security - sanitization & validation", () => {
  it("membersihkan emoji dan tag HTML berbahaya", () => {
    const dirty = "<script>alert('xss')</script> Donasi Berkah 😊🙏";
    const cleaned = sanitizeInput(dirty);

    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("😊");
    expect(cleaned).not.toContain("🙏");
    expect(cleaned).toContain("Donasi Berkah");
  });

  it("membersihkan nama donatur dari angka dan karakter aneh", () => {
    const dirtyName = "Budi 12345 Santoso, S.Kom.";
    const cleaned = sanitizeName(dirtyName);

    expect(cleaned).toBe("Budi Santoso, S.Kom.");
  });

  it("menangani donatur anonim (Hamba Allah) dengan benar", () => {
    const result = validateName("", true);

    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe("Hamba Allah");
  });
});
