import { describe, it, expect } from "vitest";
import { getAuthenticatedUser } from "@/lib/serverAuth";

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
});
