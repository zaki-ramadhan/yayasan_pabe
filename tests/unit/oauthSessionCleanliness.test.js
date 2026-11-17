import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStoredUser, loginUser, updateStoredUser } from "@/services/authService";

describe("OAuth Session Cleanliness and Client-Side Cookie Guards", () => {
  let store = {};
  let sessionStore = {};

  beforeEach(() => {
    store = {};
    sessionStore = {};
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
      getItem: (k) => sessionStore[k] || null,
      setItem: (k, v) => {
        sessionStore[k] = String(v);
      },
      removeItem: (k) => {
        delete sessionStore[k];
      },
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

  it("does not set pabe_just_logged_in in sessionStorage when notifyLogin is false or updateStoredUser is used", () => {
    const dummyUser = {
      id: "cmvylylb4000cv4fsz0s1jy58",
      name: "Zaki Ramadhan",
      email: "zakiram4dhan.2@gmail.com",
      role: "DONOR",
      phone: "-",
      expiresAt: Date.now() + 86400000,
    };

    loginUser(dummyUser);
    expect(globalThis.sessionStorage.getItem("pabe_just_logged_in")).toBe("Zaki Ramadhan");

    globalThis.sessionStorage.removeItem("pabe_just_logged_in");
    expect(globalThis.sessionStorage.getItem("pabe_just_logged_in")).toBeNull();

    updateStoredUser({ phone: "081234567890" });
    expect(globalThis.sessionStorage.getItem("pabe_just_logged_in")).toBeNull();

    const updated = getStoredUser();
    expect(updated.phone).toBe("081234567890");
    expect(updated.name).toBe("Zaki Ramadhan");
  });
});