import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/media/[...path]/route";
import * as serverAuth from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

describe("Media Proxy Security & Path Isolation (R2 Gateway)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menolak akses path traversal yang mengandung .. atau karakter berbahaya dengan HTTP 400", async () => {
    const req = new Request("http://localhost:3000/api/media/../etc/passwd");
    const res = await GET(req, { params: Promise.resolve({ path: ["..", "etc", "passwd"] }) });

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("Akses path tidak valid");
  });

  it("memblokir akses publik ke folder arsip database backups/ dengan HTTP 403 Forbidden", async () => {
    const req = new Request("http://localhost:3000/api/media/backups/database/db_yayasan.sql.gz");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["backups", "database", "db_yayasan.sql.gz"] }),
    });

    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toContain("arsip pencadangan dilarang");
  });

  it("menolak akses anonim ke berkas resume pelamar careers/resumes/ dengan HTTP 401 Unauthorized", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/media/careers/resumes/cv-ahmad.pdf");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["careers", "resumes", "cv-ahmad.pdf"] }),
    });

    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toContain("Autentikasi administrator diperlukan");
  });

  it("menolak akses donatur biasa ke berkas resume pelamar dengan HTTP 403 Forbidden", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue({
      id: "usr-donor-1",
      email: "donatur@gmail.com",
      role: USER_ROLES.DONOR,
    });

    const req = new Request("http://localhost:3000/api/media/careers/resumes/cv-ahmad.pdf");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["careers", "resumes", "cv-ahmad.pdf"] }),
    });

    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toContain("Hanya administrator yang berwenang");
  });

  it("mengizinkan admin mengakses resume pelamar dengan header Cache-Control private no-store", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue({
      id: "usr-admin-1",
      email: "admin@pabe.or.id",
      role: USER_ROLES.ADMIN,
    });

    // Mock response S3 GetObjectCommand
    const mockSend = vi.fn().mockResolvedValue({
      ContentType: "application/pdf",
      ContentLength: 1024,
      Body: {
        transformToWebStream: () => new ReadableStream(),
      },
    });

    // Mock S3Client
    process.env.R2_ACCOUNT_ID = "mock-acc";
    process.env.R2_ACCESS_KEY_ID = "mock-key";
    process.env.R2_SECRET_ACCESS_KEY = "mock-secret";

    const s3Module = await import("@aws-sdk/client-s3");
    vi.spyOn(s3Module.S3Client.prototype, "send").mockImplementation(mockSend);

    const req = new Request("http://localhost:3000/api/media/careers/resumes/cv-ahmad.pdf");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["careers", "resumes", "cv-ahmad.pdf"] }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, no-cache, no-store, must-revalidate");
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });
});
