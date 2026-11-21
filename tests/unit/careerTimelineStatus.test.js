import { describe, it, expect } from "vitest";
import { getStepStatus, CAREER_STEPS, getStepTitle, getActiveStepIndex } from "@/components/donor/career/DonorCareerTimeline";
import { getStepSubtitle } from "@/lib/careerStepperConfig";

describe("Career Timeline & Stepper - 3 Tahap Alur Rekrutmen Yayasan", () => {
  it("should have exactly 3 steps aligned with foundation recruitment workflow", () => {
    expect(CAREER_STEPS).toHaveLength(3);
    expect(CAREER_STEPS[0].title).toBe("Lamaran Terkirim");
    expect(CAREER_STEPS[1].title).toBe("Ditinjau");
    expect(CAREER_STEPS[2].title).toBe("Keputusan");
  });

  it("should return completed only for step 0 and upcoming for steps 1 & 2 when status is PENDING (Menunggu)", () => {
    expect(getStepStatus(0, "PENDING")).toBe("completed");
    expect(getStepStatus(1, "PENDING")).toBe("upcoming");
    expect(getStepStatus(2, "PENDING")).toBe("upcoming");
    expect(getStepSubtitle(0, "completed", "PENDING")).toBe("Selesai");
    expect(getStepSubtitle(1, "upcoming", "PENDING")).toBe("Menunggu");
    expect(getStepSubtitle(2, "upcoming", "PENDING")).toBe("Menunggu");
    expect(getStepTitle(0, "PENDING")).toBe("Lamaran Terkirim");
    expect(getStepTitle(1, "PENDING")).toBe("Ditinjau");
    expect(getStepTitle(2, "PENDING")).toBe("Keputusan");
    expect(getActiveStepIndex("PENDING")).toBe(0);
  });

  it("should return completed for step 0 and active for step 1 when status is REVIEWED (Ditinjau)", () => {
    expect(getStepStatus(0, "REVIEWED")).toBe("completed");
    expect(getStepStatus(1, "REVIEWED")).toBe("active");
    expect(getStepStatus(2, "REVIEWED")).toBe("upcoming");
    expect(getStepSubtitle(1, "active", "REVIEWED")).toBe("Ditinjau");
    expect(getStepTitle(2, "REVIEWED")).toBe("Keputusan");
    expect(getActiveStepIndex("REVIEWED")).toBe(1);
  });

  it("should return completed for all 3 steps with title Diterima when status is SHORTLISTED or ACCEPTED", () => {
    expect(getStepStatus(0, "SHORTLISTED")).toBe("completed");
    expect(getStepStatus(1, "SHORTLISTED")).toBe("completed");
    expect(getStepStatus(2, "SHORTLISTED")).toBe("completed");
    expect(getStepSubtitle(2, "completed", "SHORTLISTED")).toBe("Diterima");
    expect(getStepTitle(2, "SHORTLISTED")).toBe("Diterima");

    expect(getStepStatus(0, "ACCEPTED")).toBe("completed");
    expect(getStepStatus(1, "ACCEPTED")).toBe("completed");
    expect(getStepStatus(2, "ACCEPTED")).toBe("completed");
    expect(getStepTitle(2, "ACCEPTED")).toBe("Diterima");
    expect(getActiveStepIndex("ACCEPTED")).toBe(2);
  });

  it("should return rejected for step 2 with title Ditolak when status is REJECTED", () => {
    expect(getStepStatus(0, "REJECTED")).toBe("completed");
    expect(getStepStatus(1, "REJECTED")).toBe("completed");
    expect(getStepStatus(2, "REJECTED")).toBe("rejected");
    expect(getStepSubtitle(2, "rejected", "REJECTED")).toBe("Ditolak");
    expect(getStepTitle(2, "REJECTED")).toBe("Ditolak");
    expect(getActiveStepIndex("REJECTED")).toBe(2);
  });
});
