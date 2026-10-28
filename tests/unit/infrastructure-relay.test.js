import { describe, it, expect, vi, beforeEach } from "vitest";
import { isInfrastructureEmail, INFRASTRUCTURE_EMAILS } from "@/lib/infrastructureConstants";
import { GET as googleOAuthGet } from "@/app/api/admin/external/google-oauth/route";
import { GET as facebookOAuthGet } from "@/app/api/admin/external/facebook-oauth/route";
import { GET as cloudflareR2Get } from "@/app/api/admin/external/cloudflare-r2/route";
import * as serverAuth from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { NextResponse } from "next/server";

describe("Infrastructure Whitelist & Security", () => {
  it("memverifikasi email terdaftar pada whitelist pengembang secara case-insensitive", () => {
    expect(isInfrastructureEmail("zakiram4dhan@gmail.com")).toBe(true);
    expect(isInfrastructureEmail("ZAKIRAM4DHAN@GMAIL.COM ")).toBe(true);
    expect(isInfrastructureEmail("piscokpiscok2610@gmail.com")).toBe(true);
    expect(isInfrastructureEmail("PISCOKPISCOK2610@GMAIL.COM")).toBe(true);
  });

  it("menolak email yang tidak ada dalam daftar whitelist pengembang", () => {
    expect(isInfrastructureEmail("admin.yayasan@pabe.or.id")).toBe(false);
    expect(isInfrastructureEmail("hacker@malicious.com")).toBe(false);
    expect(isInfrastructureEmail("")).toBe(false);
    expect(isInfrastructureEmail(null)).toBe(false);
    expect(isInfrastructureEmail(undefined)).toBe(false);
  });
});

describe("Admin External Relay API Security", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Google OAuth Relay: menolak request tanpa autentikasi yang valid", async () => {
    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: null,
      errorResponse: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
    });

    const req = new Request("http://localhost:3000/api/admin/external/google-oauth");
    const res = await googleOAuthGet(req);

    expect(res.status).toBe(401);
  });

  it("Google OAuth Relay: menolak superadmin yang tidak masuk whitelist email pengembang (403)", async () => {
    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: { email: "other.superadmin@pabe.or.id", role: USER_ROLES.SUPER_ADMIN },
      errorResponse: null,
    });

    const req = new Request("http://localhost:3000/api/admin/external/google-oauth");
    const res = await googleOAuthGet(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("Google OAuth Relay: mengarahkan akun whitelist ke Google Cloud Console (307)", async () => {
    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: { email: "zakiram4dhan@gmail.com", role: USER_ROLES.SUPER_ADMIN },
      errorResponse: null,
    });

    const req = new Request("http://localhost:3000/api/admin/external/google-oauth");
    const res = await googleOAuthGet(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://console.cloud.google.com/auth/clients?authuser=0&project=web-ypabe&supportedpurview=project"
    );
  });

  it("Facebook OAuth Relay: menolak superadmin non-whitelist (403)", async () => {
    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: { email: "other.superadmin@pabe.or.id", role: USER_ROLES.SUPER_ADMIN },
      errorResponse: null,
    });

    const req = new Request("http://localhost:3000/api/admin/external/facebook-oauth");
    const res = await facebookOAuthGet(req);

    expect(res.status).toBe(403);
  });

  it("Facebook OAuth Relay: mengarahkan akun whitelist ke Meta for Developers (307)", async () => {
    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: { email: "piscokpiscok2610@gmail.com", role: USER_ROLES.SUPER_ADMIN },
      errorResponse: null,
    });

    const req = new Request("http://localhost:3000/api/admin/external/facebook-oauth");
    const res = await facebookOAuthGet(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://developers.facebook.com/apps/1105847055308833/settings/basic/");
  });

  it("Cloudflare R2 Relay: mengarahkan akun whitelist ke dashboard Cloudflare R2 (307)", async () => {
    process.env.R2_ACCOUNT_ID = "test-account-123";
    process.env.R2_BUCKET_NAME = "test-bucket";

    vi.spyOn(serverAuth, "requireAuth").mockResolvedValue({
      user: { email: "zakiram4dhan@gmail.com", role: USER_ROLES.SUPER_ADMIN },
      errorResponse: null,
    });

    const req = new Request("http://localhost:3000/api/admin/external/cloudflare-r2");
    const res = await cloudflareR2Get(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("dash.cloudflare.com");
  });
});
