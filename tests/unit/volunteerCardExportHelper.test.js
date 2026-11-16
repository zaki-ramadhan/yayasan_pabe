import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/hooks/useToast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="),
}));

import {
  formatSafeFileName,
  downloadSingleCardSidePng,
  downloadSingleVolunteerZip,
} from "@/lib/volunteerCardExportHelper";

describe("Volunteer Card Export & ZIP Packaging Helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatSafeFileName", () => {
    it("membersihkan spasi, karakter non-alfanumerik, dan simbol berbahaya", () => {
      const result = formatSafeFileName("  Budi  Santoso, S.Kom. / ID#123! ");
      expect(result).toBe("Budi-Santoso-SKom-ID123");
    });

    it("menangani fallback string kosong atau null secara aman", () => {
      expect(formatSafeFileName("")).toBe("Relawan");
      expect(formatSafeFileName(null)).toBe("Relawan");
      expect(formatSafeFileName(undefined)).toBe("Relawan");
    });

    it("membatasi panjang nama file maksimal 50 karakter agar aman di semua sistem operasi", () => {
      const veryLongName = "A".repeat(100);
      const result = formatSafeFileName(veryLongName);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });

  describe("downloadSingleCardSidePng", () => {
    it("mengunduh sisi depan atau belakang dengan nama file yang rapi", async () => {
      const mockElement = { id: "front-card" };
      const volunteer = { fullName: "Ahmad Dahlan" };
      const mockAnchor = {
        download: "",
        href: "",
        click: vi.fn(),
      };

      global.window = {};
      global.document = {
        createElement: vi.fn().mockReturnValue(mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      const ok = await downloadSingleCardSidePng({
        volunteer,
        element: mockElement,
        side: "Depan",
      });

      expect(ok).toBe(true);
      expect(mockAnchor.download).toBe("Kartu-Relawan-Ahmad-Dahlan-Depan.png");
      expect(mockAnchor.click).toHaveBeenCalled();

      delete global.window;
      delete global.document;
    });
  });

  describe("downloadSingleVolunteerZip", () => {
    it("mengemas sisi depan dan belakang ke dalam satu file ZIP terstruktur", async () => {
      const frontEl = { id: "front" };
      const backEl = { id: "back" };
      const volunteer = { fullName: "Siti Nurhaliza" };
      const mockAnchor = {
        download: "",
        href: "",
        click: vi.fn(),
      };

      global.window = {
        URL: {
          createObjectURL: vi.fn().mockReturnValue("blob:mock-zip-url"),
          revokeObjectURL: vi.fn(),
        },
      };
      global.document = {
        createElement: vi.fn().mockReturnValue(mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      const ok = await downloadSingleVolunteerZip({
        volunteer,
        frontElement: frontEl,
        backElement: backEl,
      });

      expect(ok).toBe(true);
      expect(mockAnchor.download).toBe("Kartu-Relawan-Siti-Nurhaliza.zip");
      expect(mockAnchor.click).toHaveBeenCalled();

      delete global.window;
      delete global.document;
    });
  });
});
