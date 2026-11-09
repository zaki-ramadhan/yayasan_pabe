import { describe, it, expect } from "vitest";
import { isNonStructuralTechTitle, NON_STRUCTURAL_TECH_KEYWORDS } from "@/constants/staffConstants";

describe("Penyaringan Jabatan Teknis Non-Struktural (isNonStructuralTechTitle)", () => {
  it("mengidentifikasi jabatan pengurus yayasan yang sah sebagai struktural (lolos publik)", () => {
    expect(isNonStructuralTechTitle("Ketua Yayasan")).toBe(false);
    expect(isNonStructuralTechTitle("Sekretaris")).toBe(false);
    expect(isNonStructuralTechTitle("Bendahara")).toBe(false);
    expect(isNonStructuralTechTitle("Kepala Divisi Program & Operasional")).toBe(false);
    expect(isNonStructuralTechTitle("Dewan Pembina Yayasan")).toBe(false);
    expect(isNonStructuralTechTitle("Dewan Pengawas")).toBe(false);
    expect(isNonStructuralTechTitle("Koordinator Relawan Lapangan")).toBe(false);
  });

  it("mengecualikan peran teknis pengelola website dari publik", () => {
    expect(isNonStructuralTechTitle("Admin Web")).toBe(true);
    expect(isNonStructuralTechTitle("admin web")).toBe(true);
    expect(isNonStructuralTechTitle("Pengelola Web")).toBe(true);
    expect(isNonStructuralTechTitle("Webmaster")).toBe(true);
    expect(isNonStructuralTechTitle("IT Support")).toBe(true);
    expect(isNonStructuralTechTitle("Staf IT")).toBe(true);
    expect(isNonStructuralTechTitle("Developer")).toBe(true);
    expect(isNonStructuralTechTitle("Programmer")).toBe(true);
    expect(isNonStructuralTechTitle("Super Admin")).toBe(true);
  });

  it("menangani string kosong atau null", () => {
    expect(isNonStructuralTechTitle("")).toBe(true);
    expect(isNonStructuralTechTitle(null)).toBe(true);
    expect(isNonStructuralTechTitle(undefined)).toBe(true);
  });
});

