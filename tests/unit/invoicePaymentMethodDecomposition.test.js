import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadQrisImage } from "@/lib/qrisCanvasExporter";

describe("Invoice Payment Method Refactoring Audit & Unit Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("downloadQrisImage Exporter Helper", () => {
    it("menangani kasus saat SVG tidak ditemukan dan tanpa simulator URL dengan aman", async () => {
      const result = await downloadQrisImage({
        donation: { invoiceId: "INV-TEST-001" },
        effectiveSimulatorUrl: "",
      });
      expect(result).toBe(false);
    });

    it("mengembalikan false tanpa melempar uncaught exception jika argumen bernilai null/undefined", async () => {
      const result = await downloadQrisImage({});
      expect(result).toBe(false);
    });
  });
});

