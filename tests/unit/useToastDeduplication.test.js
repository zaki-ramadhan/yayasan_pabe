import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "@/hooks/useToast";

describe("useToast Anti-Duplicate Guard", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("mencegah kemunculan dua notifikasi yang sama persis dalam window 600ms", () => {
    const toast1 = toast.success("Data berhasil diperbarui.");
    const toast2 = toast.success("Data berhasil diperbarui.");

    expect(toast1.id).not.toBe("suppressed-duplicate");
    expect(toast2.id).toBe("suppressed-duplicate");
  });

  it("mengizinkan notifikasi dengan pesan berbeda", () => {
    const toast1 = toast.success("Pesan pertama");
    const toast2 = toast.success("Pesan kedua");

    expect(toast1.id).not.toBe("suppressed-duplicate");
    expect(toast2.id).not.toBe("suppressed-duplicate");
  });

  it("mengizinkan notifikasi yang sama setelah jeda window berlalu", async () => {
    const toast1 = toast.info("Info unik berulang");
    expect(toast1.id).not.toBe("suppressed-duplicate");

    await new Promise((resolve) => setTimeout(resolve, 650));

    const toast2 = toast.info("Info unik berulang");
    expect(toast2.id).not.toBe("suppressed-duplicate");
  });
});

