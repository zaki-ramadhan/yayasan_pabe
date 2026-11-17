import { describe, it, expect } from "vitest";
import { calculateLiveCampaignMetrics } from "@/hooks/useCampaignLiveStats";

describe("useCampaignLiveStats - calculateLiveCampaignMetrics logic", () => {
  it("menghitung metrik dan persentase progress secara presisi", () => {
    const result = calculateLiveCampaignMetrics({
      collectedAmount: 750000,
      targetAmount: 1000000,
      donorCount: 15,
    });

    expect(result.collectedAmount).toBe(750000);
    expect(result.targetAmount).toBe(1000000);
    expect(result.donorCount).toBe(15);
    expect(result.progress).toBe(75);
  });

  it("menangani targetAmount 0 atau tidak terbatas tanpa pembagian nol", () => {
    const result = calculateLiveCampaignMetrics({
      collectedAmount: 500000,
      targetAmount: 0,
      donorCount: 5,
    });

    expect(result.collectedAmount).toBe(500000);
    expect(result.targetAmount).toBe(0);
    expect(result.donorCount).toBe(5);
    expect(result.progress).toBe(0);
  });

  it("melakukan sanitasi input non-numerik atau undefined secara defensif", () => {
    const result = calculateLiveCampaignMetrics({
      collectedAmount: "1200000",
      targetAmount: null,
      donorCount: undefined,
    });

    expect(result.collectedAmount).toBe(1200000);
    expect(result.targetAmount).toBe(0);
    expect(result.donorCount).toBe(0);
    expect(result.progress).toBe(0);
  });
});
