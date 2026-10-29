import { describe, it, expect } from "vitest";
import { isFormDirty, areFormValuesEqual, normalizeFormValue } from "@/lib/formUtils";

describe("formUtils - SSOT Dirty Checking & Value Normalization", () => {
  it("normalisasi null, undefined, dan spasi kosong menjadi empty string", () => {
    expect(normalizeFormValue(null)).toBe("");
    expect(normalizeFormValue(undefined)).toBe("");
    expect(normalizeFormValue("   ")).toBe("");
    expect(normalizeFormValue(" halo dunia ")).toBe("halo dunia");
    expect(normalizeFormValue(12345)).toBe(12345);
    expect(normalizeFormValue(false)).toBe(false);
  });

  it("mendeteksi perbandingan nilai primitif dengan whitespace trim", () => {
    expect(areFormValuesEqual("admin", " admin ")).toBe(true);
    expect(areFormValuesEqual(null, "")).toBe(true);
    expect(areFormValuesEqual(undefined, "")).toBe(true);
    expect(areFormValuesEqual(null, undefined)).toBe(true);
    expect(areFormValuesEqual("admin", "superadmin")).toBe(false);
    expect(isFormDirty("admin", "admin")).toBe(false);
    expect(isFormDirty("admin", "admin ")).toBe(false);
    expect(isFormDirty("admin", "staf")).toBe(true);
  });

  it("mendeteksi perbandingan objek bertingkat (nested objects)", () => {
    const initial = {
      name: "Yayasan Payung Berkah",
      contacts: {
        email: "info@pabe.org",
        phone: "08123456789",
      },
    };

    const identicalWithSpacing = {
      name: " Yayasan Payung Berkah ",
      contacts: {
        email: "info@pabe.org",
        phone: " 08123456789 ",
      },
    };

    const modified = {
      name: "Yayasan Payung Berkah",
      contacts: {
        email: "info@pabe.org",
        phone: "08987654321", // changed
      },
    };

    expect(isFormDirty(initial, identicalWithSpacing)).toBe(false);
    expect(isFormDirty(initial, modified)).toBe(true);
  });

  it("mendeteksi perbandingan array objek (seperti daftar rekening bank)", () => {
    const initialAccounts = [
      { bank: "BSI", accountNumber: "7123456789", accountName: "Yayasan" },
      { bank: "Mandiri", accountNumber: "123000456", accountName: "Yayasan" },
    ];

    const sameAccounts = [
      { bank: "BSI", accountNumber: " 7123456789 ", accountName: "Yayasan" },
      { bank: "Mandiri", accountNumber: "123000456", accountName: "Yayasan" },
    ];

    const editedAccount = [
      { bank: "BSI", accountNumber: "7123456789", accountName: "Yayasan Baru" },
      { bank: "Mandiri", accountNumber: "123000456", accountName: "Yayasan" },
    ];

    const addedAccount = [
      ...initialAccounts,
      { bank: "BCA", accountNumber: "88888", accountName: "Yayasan" },
    ];

    expect(isFormDirty(initialAccounts, sameAccounts)).toBe(false);
    expect(isFormDirty(initialAccounts, editedAccount)).toBe(true);
    expect(isFormDirty(initialAccounts, addedAccount)).toBe(true);
  });
});
