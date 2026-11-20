import { describe, it, expect } from "vitest";
import { validateWebUrl, validateResumeUrl } from "@/lib/validator";

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

describe("validateResumeUrl Unit Tests (Internal Media Path & External URL)", () => {
  it("menerima path berkas internal hasil unggah PDF yayasan", () => {
    const res = validateResumeUrl("/api/media/careers/resumes/job-cv_file_123_456.pdf");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("/api/media/careers/resumes/job-cv_file_123_456.pdf");
  });

  it("menerima URL web eksternal valid (Cloudflare R2, Google Drive)", () => {
    const res = validateResumeUrl("https://r2.storage.com/cv/resume.pdf");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://r2.storage.com/cv/resume.pdf");
  });

  it("menolak jika berkas kosong atau string tidak valid", () => {
    expect(validateResumeUrl("").isValid).toBe(false);
    expect(validateResumeUrl("   ").isValid).toBe(false);
    expect(validateResumeUrl(null).isValid).toBe(false);
    expect(validateResumeUrl("bukan-url-dan-bukan-path").isValid).toBe(false);
  });

  it("menolak path internal yang mengandung spasi", () => {
    const res = validateResumeUrl("/api/media/careers/cv file saya.pdf");
    expect(res.isValid).toBe(false);
    expect(res.message).toMatch(/spasi/i);
  });
});
