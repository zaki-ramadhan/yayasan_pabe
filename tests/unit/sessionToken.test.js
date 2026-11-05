import { describe, it, expect, vi } from "vitest";
import {
  createSignedSessionToken,
  verifySessionToken,
  getSessionSecret,
} from "@/lib/sessionToken";

describe("Cryptographic Session Token Security (HMAC-SHA256)", () => {
  it("menghasilkan token sesi tertanda tangan dengan format <payload>.<signature>", () => {
    const token = createSignedSessionToken({
      id: "usr_12345",
      email: "donatur@example.com",
      role: "DONOR",
    });

    expect(token).toBeTypeOf("string");
    expect(token).toContain(".");
    const parts = token.split(".");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(10);
    expect(parts[1].length).toBeGreaterThan(10);
  });

  it("memverifikasi token sah dan mengembalikan data pengguna", () => {
    const token = createSignedSessionToken(
      {
        id: "usr_admin_999",
        email: "admin@pabe.or.id",
        role: "ADMIN",
      },
      3600
    );

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe("usr_admin_999");
    expect(verified?.email).toBe("admin@pabe.or.id");
    expect(verified?.role).toBe("ADMIN");
    expect(verified?.exp).toBeGreaterThan(Date.now());
  });

  it("menolak token yang dimanipulasi (tampered payload atau tampered role)", () => {
    const token = createSignedSessionToken({
      id: "usr_donor_1",
      email: "donor@pabe.or.id",
      role: "DONOR",
    });

    const [payloadB64, signature] = token.split(".");
    // Manipulasi payload agar menjadi SUPER_ADMIN
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        id: "usr_donor_1",
        email: "donor@pabe.or.id",
        role: "SUPER_ADMIN",
        exp: Date.now() + 3600000,
      })
    ).toString("base64url");

    const forgedToken = `${tamperedPayload}.${signature}`;
    const result = verifySessionToken(forgedToken);
    expect(result).toBeNull();
  });

  it("menolak token yang tanda tangannya salah atau dimanipulasi", () => {
    const token = createSignedSessionToken({
      id: "usr_staff_2",
      role: "FINANCE",
    });

    const [payloadB64] = token.split(".");
    const invalidToken = `${payloadB64}.invalidsignature1234567890`;
    const result = verifySessionToken(invalidToken);
    expect(result).toBeNull();
  });

  it("menolak token yang telah kedaluwarsa", () => {
    // Buat token dengan waktu kedaluwarsa di masa lalu (-10 detik)
    vi.useFakeTimers();
    const token = createSignedSessionToken(
      {
        id: "usr_expired",
        role: "DONOR",
      },
      10 // 10 detik
    );

    // Majukan waktu 15 detik
    vi.advanceTimersByTime(15000);

    const result = verifySessionToken(token);
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it("menolak string polos / plain email tanpa signature (anti session hijacking)", () => {
    expect(verifySessionToken("superadmin@pabe.or.id")).toBeNull();
    expect(verifySessionToken("zakiram4dhan@gmail.com")).toBeNull();
    expect(verifySessionToken("USR-001")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });
});

