import { describe, it, expect, vi, beforeEach } from "vitest";

const updateManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    galleryItem: {
      updateMany: (...args) => updateManyMock(...args),
    },
  },
}));

import { updateGalleryItemsBatch } from "@/services/adminGalleryService";

describe("updateGalleryItemsBatch", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
    updateManyMock.mockResolvedValue({ count: 2 });
  });

  it("only updates opted-in fields and ignores non-whitelisted fields", async () => {
    const result = await updateGalleryItemsBatch(["id-1", "id-2"], {
      title: "  Santunan Akbar  ",
      imageUrl: "https://evil.example/hijack.jpg",
      id: "hacked",
    });

    expect(result).toEqual({ count: 2 });
    expect(updateManyMock).toHaveBeenCalledTimes(1);
    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["id-1", "id-2"] } },
      data: { title: "Santunan Akbar" },
    });
  });

  it("clears activityDate and description to null when empty string is passed", async () => {
    await updateGalleryItemsBatch(["id-1"], {
      activityDate: "",
      description: "",
    });

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["id-1"] } },
      data: { activityDate: null, description: null },
    });
  });

  it("rejects empty updates, invalid dates, and oversized batches", async () => {
    await expect(updateGalleryItemsBatch(["id-1"], {})).rejects.toThrow("Pilih minimal satu kolom");
    await expect(updateGalleryItemsBatch(["id-1"], { activityDate: "not-a-date" })).rejects.toThrow(
      "Format tanggal kegiatan tidak valid"
    );

    const tooManyIds = Array.from({ length: 101 }, (_, idx) => `id-${idx}`);
    await expect(updateGalleryItemsBatch(tooManyIds, { title: "Test" })).rejects.toThrow("Maksimal 100");
  });
});

