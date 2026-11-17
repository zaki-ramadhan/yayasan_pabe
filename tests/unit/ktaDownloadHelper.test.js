import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadVolunteerCardImage } from "@/lib/ktaDownloadHelper";
import * as toastModule from "@/hooks/useToast";

vi.mock("@/hooks/useToast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,mockPngBase64Data"),
}));

describe("ktaDownloadHelper - High-Resolution PNG Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengembalikan false secara aman jika dijalankan di luar browser (SSR / Node)", async () => {
    const originalWindow = global.window;
    delete global.window;

    const result = await downloadVolunteerCardImage("element-id");
    expect(result).toBe(false);

    global.window = originalWindow;
  });

  it("mengembalikan false dan memunculkan toast error jika target element tidak ditemukan di DOM", async () => {
    global.window = {};
    global.document = {
      getElementById: vi.fn().mockReturnValue(null),
    };

    const result = await downloadVolunteerCardImage("missing-id");
    expect(result).toBe(false);
    expect(toastModule.toast.error).toHaveBeenCalledWith(
      "Gagal menemukan elemen kartu untuk diunduh."
    );

    delete global.window;
    delete global.document;
  });

  it("berhasil merender elemen dan memicu unduhan file PNG tersanitasi", async () => {
    const mockNode = { id: "mock-card-node" };
    const mockAnchor = {
      download: "",
      href: "",
      click: vi.fn(),
    };

    global.window = {};
    global.document = {
      getElementById: vi.fn().mockReturnValue(mockNode),
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };

    const result = await downloadVolunteerCardImage("mock-card-node", {
      volunteerName: "Ahmad Mujahid (Relawan)",
      volunteerId: "PABE-VOL-2026-001",
    });

    expect(result).toBe(true);
    expect(mockAnchor.download).toBe("Kartu-Relawan-Payung-Berkah-Ahmad-Mujahid-Relawan-PABE-VOL-2026-001.png");
    expect(mockAnchor.href).toBe("data:image/png;base64,mockPngBase64Data");
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(toastModule.toast.success).toHaveBeenCalledWith(
      "Kartu relawan berhasil diunduh."
    );

    delete global.window;
    delete global.document;
  });
});
