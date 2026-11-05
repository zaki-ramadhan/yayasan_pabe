import { describe, it, expect } from "vitest";
import { getAuthenticatedUser, createSignedSessionToken } from "@/lib/serverAuth";

describe("getAuthenticatedUser session resolution", () => {
  it("resolves user from x-pabe-session header with email", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { "x-pabe-session": "zakiram4dhan@gmail.com" },
    });
    const result = await getAuthenticatedUser(req);
    expect(result.authenticated).toBe(true);
    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe("zakiram4dhan@gmail.com");
    expect(result.user.role).toBe("SUPER_ADMIN");
  });

  it("resolves donor user from Cookie header", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: "pabe_session=zakiram4dhan.2@gmail.com" },
    });
    const result = await getAuthenticatedUser(req);
    expect(result.authenticated).toBe(true);
    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe("zakiram4dhan.2@gmail.com");
    expect(result.user.role).toBe("DONOR");
  });

  it("resolves user from cryptographically signed session token", async () => {
    const signedToken = createSignedSessionToken({
      id: "USR-001",
      email: "superadmin@pabe.or.id",
      role: "SUPER_ADMIN",
    });

    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: `pabe_session=${signedToken}` },
    });

    const result = await getAuthenticatedUser(req);
    expect(result.authenticated).toBe(true);
    expect(result.user).not.toBeNull();
    expect(result.user.role).toBe("SUPER_ADMIN");
  });

  it("resolves user by verified email if token id is an OAuth fallback id", async () => {
    const signedToken = createSignedSessionToken({
      id: "USR-GGL-NON_EXISTENT_ID",
      email: "zakiram4dhan@gmail.com",
      role: "SUPER_ADMIN",
    });

    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: `pabe_session=${signedToken}` },
    });

    const result = await getAuthenticatedUser(req);
    expect(result.authenticated).toBe(true);
    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe("zakiram4dhan@gmail.com");
  });

  it("rejects forged signed session token with invalid HMAC signature", async () => {
    const forgedToken = "eyJpZCI6IlVTUi0wMDEiLCJyb2xlIjoiU1VQRVJfQURNSU4ifQ.fake_signature_hash";

    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: `pabe_session=${forgedToken}` },
    });

    const result = await getAuthenticatedUser(req);
    expect(result.authenticated).toBe(false);
    expect(result.reason).toBe("INVALID_SESSION_SIGNATURE");
  });

  it("rejects unsigned plain session token when NODE_ENV is production", async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      const req = new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: "pabe_session=superadmin@pabe.or.id" },
      });

      const result = await getAuthenticatedUser(req);
      expect(result.authenticated).toBe(false);
      expect(result.reason).toBe("UNSIGNED_SESSION_REJECTED");
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
