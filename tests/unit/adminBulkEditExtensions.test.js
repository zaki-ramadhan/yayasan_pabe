import { describe, it, expect, vi, beforeEach } from "vitest";

const faqUpdateManyMock = vi.fn();
const vacancyUpdateManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    faq: {
      updateMany: (...args) => faqUpdateManyMock(...args),
    },
    jobVacancy: {
      updateMany: (...args) => vacancyUpdateManyMock(...args),
    },
  },
}));

import { updateAdminFaqsBatch } from "@/services/adminFaqService";
import { updateAdminVacanciesBatch } from "@/services/adminCareerService";

describe("updateAdminFaqsBatch", () => {
  beforeEach(() => {
    faqUpdateManyMock.mockReset();
    faqUpdateManyMock.mockResolvedValue({ count: 2 });
  });

  it("updates only whitelisted FAQ fields atomically", async () => {
    const res = await updateAdminFaqsBatch(["f1", "f2"], {
      category: "  Zakat & Infak  ",
      isActive: false,
      question: "Hijack question",
    });

    expect(res).toEqual({ count: 2 });
    expect(faqUpdateManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["f1", "f2"] } },
      data: { category: "Zakat & Infak", isActive: false },
    });
  });

  it("rejects empty updates and oversized ID lists", async () => {
    await expect(updateAdminFaqsBatch(["f1"], {})).rejects.toThrow("Pilih minimal satu kolom");
    const tooMany = Array.from({ length: 101 }, (_, i) => `f-${i}`);
    await expect(updateAdminFaqsBatch(tooMany, { isActive: true })).rejects.toThrow("Maksimal 100");
  });
});

describe("updateAdminVacanciesBatch", () => {
  beforeEach(() => {
    vacancyUpdateManyMock.mockReset();
    vacancyUpdateManyMock.mockResolvedValue({ count: 3 });
  });

  it("updates only whitelisted vacancy fields atomically", async () => {
    const res = await updateAdminVacanciesBatch(["v1", "v2", "v3"], {
      isActive: false,
      deadline: "2026-12-31",
      title: "Hijack title",
      quota: 999,
    });

    expect(res).toEqual({ count: 3 });
    expect(vacancyUpdateManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["v1", "v2", "v3"] } },
      data: { isActive: false, deadline: "2026-12-31" },
    });
  });

  it("rejects empty deadline, empty updates, and oversized ID lists", async () => {
    await expect(updateAdminVacanciesBatch(["v1"], { deadline: "  " })).rejects.toThrow("Batas waktu lamaran");
    await expect(updateAdminVacanciesBatch(["v1"], {})).rejects.toThrow("Pilih minimal satu kolom");
    const tooMany = Array.from({ length: 101 }, (_, i) => `v-${i}`);
    await expect(updateAdminVacanciesBatch(tooMany, { isActive: false })).rejects.toThrow("Maksimal 100");
  });
});

