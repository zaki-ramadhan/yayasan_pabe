import { describe, it, expect } from "vitest";
import {
  getNavAuthButtonConfig,
  DEFAULT_NAV_AUTH_CONFIG,
} from "@/config/navAuth";

describe("Nav Auth Button Configuration & Mapping (SSOT)", () => {
  it("menggunakan label 'Masuk Akun' yang jelas dan konsisten di berbagai rute", () => {
    const homeConfig = getNavAuthButtonConfig("/");
    expect(homeConfig.label).toBe("Masuk Akun");
    expect(homeConfig.mobileLabel).toBe("Masuk Akun");
    expect(homeConfig.href).toBe("/login");

    const zakatConfig = getNavAuthButtonConfig("/zakat");
    expect(zakatConfig.label).toBe("Masuk Akun");
    expect(zakatConfig.href).toBe("/login?redirect=%2Fzakat");

    const relawanConfig = getNavAuthButtonConfig("/relawan");
    expect(relawanConfig.label).toBe("Masuk Akun");
    expect(relawanConfig.href).toBe("/login?redirect=%2Frelawan");
  });

  it("menyematkan parameter redirect URL secara dinamis sesuai halaman aktif", () => {
    const campaignConfig = getNavAuthButtonConfig("/campaign/sedekah-subuh");
    expect(campaignConfig.label).toBe("Masuk Akun");
    expect(campaignConfig.href).toBe("/login?redirect=%2Fcampaign%2Fsedekah-subuh");
  });

  it("tidak menghasilkan recursive redirect jika pengguna sudah di halaman auth (/login, /register)", () => {
    const loginConfig = getNavAuthButtonConfig("/login");
    expect(loginConfig.href).toBe("/login");

    const registerConfig = getNavAuthButtonConfig("/register");
    expect(registerConfig.href).toBe("/login");
  });

  it("aman terhadap input null, undefined, atau tipe data non-string", () => {
    const nullConfig = getNavAuthButtonConfig(null);
    expect(nullConfig.label).toBe(DEFAULT_NAV_AUTH_CONFIG.label);
    expect(nullConfig.href).toBe("/login");

    const undefConfig = getNavAuthButtonConfig(undefined);
    expect(undefConfig.label).toBe(DEFAULT_NAV_AUTH_CONFIG.label);
    expect(undefConfig.href).toBe("/login");
  });
});
