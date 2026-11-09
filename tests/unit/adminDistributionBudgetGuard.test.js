import { describe, it, expect } from "vitest";
import {
  calculateCampaignDisbursementBudget,
  validateDisbursementAmount,
} from "@/lib/distributionConstants";

describe("Campaign Disbursement Budget Guard & Validation", () => {
  describe("calculateCampaignDisbursementBudget", () => {
    it("menghitung sisa saldo dengan benar pada kondisi normal", () => {
      const budget = calculateCampaignDisbursementBudget({
        collectedAmount: 10000000,
        totalDisbursed: 4000000,
      });

      expect(budget.collectedAmount).toBe(10000000);
      expect(budget.totalDisbursed).toBe(4000000);
      expect(budget.remainingBudget).toBe(6000000);
      expect(budget.isOverBudget).toBe(false);
    });

    it("menangani program tanpa dana masuk (Rp 0)", () => {
      const budget = calculateCampaignDisbursementBudget({
        collectedAmount: 0,
        totalDisbursed: 0,
      });

      expect(budget.collectedAmount).toBe(0);
      expect(budget.totalDisbursed).toBe(0);
      expect(budget.remainingBudget).toBe(0);
      expect(budget.isOverBudget).toBe(false);
    });

    it("mengembalikan remainingBudget 0 dan flag isOverBudget true saat total penyaluran melebihi dana terkumpul", () => {
      const budget = calculateCampaignDisbursementBudget({
        collectedAmount: 5000000,
        totalDisbursed: 6000000,
      });

      expect(budget.remainingBudget).toBe(0);
      expect(budget.isOverBudget).toBe(true);
    });

    it("menghitung anggaran saat mode edit (mengembalikan alokasi lama ke sisa saldo)", () => {
      // Program punya Rp 10.000.000 terkumpul, Rp 5.000.000 total tersalurkan.
      // Record yang sedang diedit bernilai Rp 2.000.000.
      // Sisa saldo efektif yang tersedia untuk diedit seharusnya (10.000.000 - (5.000.000 - 2.000.000)) = 7.000.000.
      const budget = calculateCampaignDisbursementBudget({
        collectedAmount: 10000000,
        totalDisbursed: 5000000,
        currentDisbursementAmount: 2000000,
      });

      expect(budget.remainingBudget).toBe(7000000);
      expect(budget.isOverBudget).toBe(false);
    });

    it("melakukan sanitasi input non-numerik atau undefined", () => {
      const budget = calculateCampaignDisbursementBudget({
        collectedAmount: "invalid",
        totalDisbursed: null,
      });

      expect(budget.collectedAmount).toBe(0);
      expect(budget.totalDisbursed).toBe(0);
      expect(budget.remainingBudget).toBe(0);
    });
  });

  describe("validateDisbursementAmount", () => {
    it("menolak nominal penyaluran 0 atau negatif", () => {
      const zeroCheck = validateDisbursementAmount(0, 5000000);
      expect(zeroCheck.isValid).toBe(false);
      expect(zeroCheck.error).toContain("Nominal dana penyaluran wajib lebih dari Rp 0.");

      const negCheck = validateDisbursementAmount(-50000, 5000000);
      expect(negCheck.isValid).toBe(false);
      expect(negCheck.error).toContain("Nominal dana penyaluran wajib lebih dari Rp 0.");
    });

    it("menyetujui nominal dalam batas saldo aman", () => {
      const check = validateDisbursementAmount(2500000, 5000000);
      expect(check.isValid).toBe(true);
      expect(check.error).toBeNull();
    });

    it("menyetujui nominal tepat sama dengan sisa saldo", () => {
      const check = validateDisbursementAmount(5000000, 5000000);
      expect(check.isValid).toBe(true);
      expect(check.error).toBeNull();
    });

    it("menolak penyaluran saat sisa saldo program Rp 0", () => {
      const check = validateDisbursementAmount(100000, 0);
      expect(check.isValid).toBe(false);
      expect(check.error).toContain("Program ini belum memiliki saldo donasi terkumpul untuk disalurkan.");
    });

    it("menolak nominal yang melampaui sisa saldo yang tersedia", () => {
      const check = validateDisbursementAmount(6000000, 5000000);
      expect(check.isValid).toBe(false);
      expect(check.error).toBe("Maksimal penyaluran Rp 5.000.000.");
    });
  });
});
