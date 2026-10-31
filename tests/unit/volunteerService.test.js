import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchVolunteerStatus,
  submitVolunteerRegistration,
  cancelVolunteerRegistration,
} from "@/services/volunteerClientService";
import * as safeFetchModule from "@/lib/safeFetch";

describe("volunteerClientService - Client Network Abstraction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchVolunteerStatus", () => {
    it("mengembalikan data: null secara aman jika email kosong", async () => {
      const result = await fetchVolunteerStatus("");
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it("memanggil endpoint yang benar dan mengembalikan data relawan", async () => {
      vi.spyOn(safeFetchModule, "safeFetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "vol-1", fullName: "Constance Kelly", status: "APPROVED" },
        }),
      });

      const result = await fetchVolunteerStatus("constance@example.com");
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe("Constance Kelly");
      expect(result.data.status).toBe("APPROVED");
    });
  });

  describe("submitVolunteerRegistration", () => {
    it("mengirim payload pendaftaran dan mengembalikan status sukses", async () => {
      vi.spyOn(safeFetchModule, "safeFetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Pendaftaran relawan berhasil dikirim.",
        }),
      });

      const result = await submitVolunteerRegistration({
        fullName: "Constance Kelly",
        email: "constance@example.com",
        phone: "081234567890",
        city: "Jakarta",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Pendaftaran relawan berhasil dikirim.");
    });
  });

  describe("cancelVolunteerRegistration", () => {
    it("mengirim request DELETE dan menangani pembatalan sukses", async () => {
      vi.spyOn(safeFetchModule, "safeFetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Pendaftaran relawan berhasil dibatalkan.",
        }),
      });

      const result = await cancelVolunteerRegistration("constance@example.com");
      expect(result.success).toBe(true);
      expect(result.message).toBe("Pendaftaran relawan berhasil dibatalkan.");
    });
  });
});
