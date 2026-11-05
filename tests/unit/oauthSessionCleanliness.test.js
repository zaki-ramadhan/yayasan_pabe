import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStoredUser, loginUser } from "@/services/authService";

describe("OAuth Session Cleanliness and Client-Side Cookie Guards", () => {
  let store = {};

  beforeEach(() => {
    store = {};
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
    globalThis.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => {
        store[k] = String(v);
      },
      removeItem: (k) => {
        delete store[k];
      },
    };
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    let cookieJar = {};
    globalThis.document = {
      get cookie() {
        return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
      },
      set cookie(val) {
        if (val === "") {
          cookieJar = {};
          return;
        }
        const [pair] = val.split(";");
        const [k, v] = pair.split("=");
        if (k && v !== undefined) {
          cookieJar[k.trim()] = v.trim();
        }
      },
    };
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.localStorage;
    delete globalThis.sessionStorage;
    delete globalThis.document;
  });

  it("does not mutate document.cookie with unsigned id during getStoredUser", () => {
    const dummyUser = {
      id: "cmvylylb4000cv4fsz0s1jy58",
      name: "Zaki Ramadhan",
      email: "zakiram4dhan.2@gmail.com",
      role: "DONOR",
      expiresAt: Date.now() + 86400000,
    };
    loginUser(dummyUser);

    globalThis.document.cookie = ""; // clear cookie
    const stored = getStoredUser();
    expect(stored).not.toBeNull();
    expect(stored.email).toBe("zakiram4dhan.2@gmail.com");
    // Ensure getStoredUser did NOT tamper with document.cookie
    expect(globalThis.document.cookie).toBe("");
  });
  it("synchronously sets both pabe_session and pabe_role cookies during loginUser for Incognito resilience", () => {
    const dummyUser = {
      id: "cmvylylb4000cv4fsz0s1jy58",
      sessionToken: "signed_mock_token.payload_sig",
      name: "Zaki Ramadhan",
      email: "zakiram4dhan.2@gmail.com",
      role: "DONOR",
      expiresAt: Date.now() + 86400000,
    };
    loginUser(dummyUser);

    expect(globalThis.document.cookie).toContain("pabe_role=DONOR");
    expect(globalThis.document.cookie).toContain("pabe_session=signed_mock_token.payload_sig");
  });
});