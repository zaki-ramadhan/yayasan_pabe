import { describe, it, expect } from "vitest";
import { validateWebUrl } from "@/lib/validator";

describe("validateWebUrl Unit Tests (URL Pattern & Anti-Plain-Text)", () => {
  it("menerima URL https valid dengan subdomain dan path", () => {
    const res = validateWebUrl("https://drive.google.com/file/d/123/view?usp=sharing");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://drive.google.com/file/d/123/view?usp=sharing");
    expect(res.message).toBe("");
  });

  it("menerima URL LinkedIn valid", () => {
    const res = validateWebUrl("https://linkedin.com/in/zakiramadhan");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://linkedin.com/in/zakiramadhan");
  });

  it("mengotomatiskan prefix https:// jika pengguna memasukkan domain valid tanpa protokol", () => {
    const res = validateWebUrl("linkedin.com/in/zakiramadhan");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://linkedin.com/in/zakiramadhan");
  });

  it("menolak jika input berupa plain teks biasa tanpa format URL", () => {
    expect(validateWebUrl("saya tidak punya link").isValid).toBe(false);
    expect(validateWebUrl("cv saya di wa").isValid).toBe(false);
    expect(validateWebUrl("none").isValid).toBe(false);
    expect(validateWebUrl("kosong").isValid).toBe(false);
  });

  it("menolak URL yang mengandung spasi di tengah", () => {
    const res = validateWebUrl("https://drive.google.com/file d/123");
    expect(res.isValid).toBe(false);
    expect(res.message).toMatch(/spasi/i);
  });

  it("menolak string kosong atau null", () => {
    expect(validateWebUrl("").isValid).toBe(false);
    expect(validateWebUrl("   ").isValid).toBe(false);
    expect(validateWebUrl(null).isValid).toBe(false);
    expect(validateWebUrl(undefined).isValid).toBe(false);
  });

  it("menolak domain tanpa TLD yang valid", () => {
    expect(validateWebUrl("http://localhost").isValid).toBe(false);
    expect(validateWebUrl("facebook").isValid).toBe(false);
  });
});
