import { describe, it, expect } from "vitest";
import {
  STATUS_COLOR_VARIANTS,
  resolveBadgeColorClass,
} from "@/components/ui/StatusSelectBadge";

describe("StatusSelectBadge - Reusable Interactive Badge Helper & Color Resolver", () => {
  it("menyediakan preset warna solid yang pekat dengan teks putih", () => {
    expect(STATUS_COLOR_VARIANTS.solid.emerald).toContain("bg-emerald-600");
    expect(STATUS_COLOR_VARIANTS.solid.emerald).toContain("text-white");
    expect(STATUS_COLOR_VARIANTS.solid.amber).toContain("bg-amber-600");
    expect(STATUS_COLOR_VARIANTS.solid.amber).toContain("text-white");
    expect(STATUS_COLOR_VARIANTS.solid.sky).toContain("bg-sky-600");
    expect(STATUS_COLOR_VARIANTS.solid.sky).toContain("text-white");
    expect(STATUS_COLOR_VARIANTS.solid.rose).toContain("bg-rose-600");
    expect(STATUS_COLOR_VARIANTS.solid.rose).toContain("text-white");
  });

  it("menyediakan preset warna subtle (pastel) untuk opsi tampilan lembut", () => {
    expect(STATUS_COLOR_VARIANTS.subtle.emerald).toContain("bg-emerald-50");
    expect(STATUS_COLOR_VARIANTS.subtle.amber).toContain("bg-amber-50");
    expect(STATUS_COLOR_VARIANTS.subtle.sky).toContain("bg-sky-50");
    expect(STATUS_COLOR_VARIANTS.subtle.rose).toContain("bg-rose-50");
  });

  it("meresolve kelas warna solid secara akurat berdasarkan kunci warna", () => {
    const emeraldClass = resolveBadgeColorClass("emerald", "solid");
    expect(emeraldClass).toBe(STATUS_COLOR_VARIANTS.solid.emerald);

    const amberClass = resolveBadgeColorClass("amber", "solid");
    expect(amberClass).toBe(STATUS_COLOR_VARIANTS.solid.amber);
  });

  it("meresolve kelas warna subtle secara akurat jika variant disetel ke subtle", () => {
    const skyClass = resolveBadgeColorClass("sky", "subtle");
    expect(skyClass).toBe(STATUS_COLOR_VARIANTS.subtle.sky);
  });

  it("memprioritaskan customClasses jika disediakan oleh opsi status", () => {
    const custom = "bg-teal-600 text-white border-teal-600";
    const resolved = resolveBadgeColorClass("emerald", "solid", custom);
    expect(resolved).toBe(custom);
  });

  it("menggunakan fallback warna slate jika kunci warna tidak ditemukan", () => {
    const fallback = resolveBadgeColorClass("unknown_color", "solid");
    expect(fallback).toBe(STATUS_COLOR_VARIANTS.solid.slate);
  });
});

