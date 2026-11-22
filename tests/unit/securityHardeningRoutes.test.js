import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { PATCH as donationPatchHandler } from "@/app/api/donations/route";
import { GET as routineGetHandler } from "@/app/api/routine-donations/route";
import { PATCH as routineDonorPatchHandler } from "@/app/api/donor/routine-donations/route";
import { DELETE as volunteerDeleteHandler } from "@/app/api/donor/volunteer/route";
import { GET as donorPrayersGetHandler } from "@/app/api/donor/prayers/route";
import { POST as aminPostHandler } from "@/app/api/donations/amin/route";
import * as serverAuth from "@/lib/serverAuth";
import * as requestOwnership from "@/lib/requestOwnership";
import { USER_ROLES } from "@/services/authService";

describe("Security Hardening: Route Handlers Endpoint Protection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("PATCH /api/donations (Donation Prayer Update)", () => {
    it("menolak pembaruan doa jika invoiceId tidak disertakan (HTTP 400)", async () => {
      const req = new Request("http://localhost:3000/api/donations", {
        method: "PATCH",
        body: JSON.stringify({ prayer: "Semoga berkah" }),
      });
      const res = await donationPatchHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain("Nomor invoice diperlukan");
    });

    it("menolak pembaruan doa jika dipanggil oleh pihak asing tanpa token kepemilikan (HTTP 403)", async () => {
      vi.spyOn(prisma.donation, "findUnique").mockResolvedValueOnce({
        id: "don-1",
        invoiceId: "INV-001",
        accessToken: "valid_random_token_1234567890abcdef",
        donorEmail: "donatur@example.com",
        status: "PAID",
      });

      const req = new Request("http://localhost:3000/api/donations", {
        method: "PATCH",
        body: JSON.stringify({
          invoiceId: "INV-001",
          prayer: "Semoga berkah",
        }),
      });

      const res = await donationPatchHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.message).toContain("Akses tidak sah");
    });

    it("menolak pembaruan doa jika donasi belum lunas/status PENDING (HTTP 400)", async () => {
      vi.spyOn(prisma.donation, "findUnique").mockResolvedValueOnce({
        id: "don-1",
        invoiceId: "INV-001",
        accessToken: "valid_random_token_1234567890abcdef",
        donorEmail: "donatur@example.com",
        status: "PENDING",
      });

      const req = new Request("http://localhost:3000/api/donations", {
        method: "PATCH",
        body: JSON.stringify({
          invoiceId: "INV-001",
          accessToken: "valid_random_token_1234567890abcdef",
          prayer: "Semoga berkah",
        }),
      });

      const res = await donationPatchHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain("berstatus lunas");
    });
  });

  describe("GET /api/routine-donations (Public Status Check & Anti-Leakage)", () => {
    it("tidak membocorkan ID internal atau nomor HP saat diakses tanpa sesi", async () => {
      vi.spyOn(prisma.routineDonation, "findFirst").mockResolvedValueOnce({
        id: "routine-sensitive-id-999",
        donorName: "Budi Raharjo",
        donorEmail: "budi@example.com",
        donorPhone: "081299998888",
        amount: 100000,
        status: "ACTIVE",
        programTitle: "Santunan Pangan Yatim",
        campaign: { title: "Santunan Pangan Yatim", slug: "santunan-yatim" },
      });

      vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValueOnce({
        authenticated: false,
        user: null,
      });

      const req = new Request("http://localhost:3000/api/routine-donations?email=budi@example.com");
      const res = await routineGetHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.hasActive).toBe(true);
      expect(json.routine.id).toBeUndefined();
      expect(json.routine.donorPhone).toBeUndefined();
      expect(json.routine.donorEmail).toBeUndefined();
      expect(json.routine.amount).toBeUndefined();
      expect(json.routine.status).toBe("ACTIVE");
      expect(json.routine.programTitle).toBe("Santunan Pangan Yatim");
    });
  });

  describe("PATCH /api/donor/routine-donations (Routine Mutation Auth & Anti-IDOR)", () => {
    it("menolak mutasi status donasi rutin jika pemanggil belum login (HTTP 401)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: null,
        errorResponse: new Response(
          JSON.stringify({ success: false, message: "Akses tidak sah." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      });

      const req = new Request("http://localhost:3000/api/donor/routine-donations", {
        method: "PATCH",
        body: JSON.stringify({ id: "routine-1", status: "PAUSED" }),
      });

      const res = await routineDonorPatchHandler(req);
      expect(res.status).toBe(401);
    });

    it("menolak IDOR jika pengguna login mencoba mengubah donasi rutin milik email lain (HTTP 403)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: { id: "usr-2", email: "intruder@example.com", role: USER_ROLES.DONOR },
        errorResponse: null,
      });

      vi.spyOn(prisma.routineDonation, "findUnique").mockResolvedValueOnce({
        id: "routine-1",
        donorEmail: "victim@example.com",
        status: "ACTIVE",
      });

      const req = new Request("http://localhost:3000/api/donor/routine-donations", {
        method: "PATCH",
        body: JSON.stringify({ id: "routine-1", status: "CANCELLED" }),
      });

      const res = await routineDonorPatchHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.message).toContain("Akses tidak sah");
    });
  });

  describe("DELETE /api/donor/volunteer (Volunteer Cancellation Auth)", () => {
    it("menolak pembatalan relawan jika pemanggil tidak memiliki sesi otentikasi (HTTP 401)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: null,
        errorResponse: new Response(
          JSON.stringify({ success: false, message: "Akses tidak sah." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      });

      const req = new Request("http://localhost:3000/api/donor/volunteer", {
        method: "DELETE",
        body: JSON.stringify({ email: "victim@example.com" }),
      });

      const res = await volunteerDeleteHandler(req);
      expect(res.status).toBe(401);
    });

    it("menolak pembatalan jika status relawan sudah disetujui/aktif (HTTP 403)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: { id: "user-vol-1", email: "relawan@example.com", role: USER_ROLES.DONOR },
        errorResponse: null,
      });

      vi.spyOn(prisma.volunteer, "findFirst").mockResolvedValueOnce({
        id: "vol-approved-1",
        email: "relawan@example.com",
        fullName: "Ahmad Relawan",
        status: "APPROVED",
      });

      const req = new Request("http://localhost:3000/api/donor/volunteer", {
        method: "DELETE",
      });

      const res = await volunteerDeleteHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.message).toContain("Status keanggotaan relawan Anda telah aktif");
    });
  });

  describe("GET /api/donor/prayers (Anti-IDOR Prayer Protection)", () => {
    it("menolak akses doa jika pemanggil tidak terautentikasi (HTTP 401)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: null,
        errorResponse: new Response(
          JSON.stringify({ success: false, message: "Akses tidak sah." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      });

      const req = new Request("http://localhost:3000/api/donor/prayers?email=victim@example.com");
      const res = await donorPrayersGetHandler(req);
      expect(res.status).toBe(401);
    });

    it("menolak jika donatur reguler mencoba mengintip doa donatur lain (HTTP 403)", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: { id: "user-1", email: "attacker@example.com", role: USER_ROLES.DONOR },
        errorResponse: null,
      });

      const req = new Request("http://localhost:3000/api/donor/prayers?email=victim@example.com");
      const res = await donorPrayersGetHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.message).toContain("Anda tidak memiliki izin");
    });

    it("mengizinkan donatur memuat doanya sendiri", async () => {
      vi.spyOn(serverAuth, "requireAuth").mockResolvedValueOnce({
        user: { id: "user-1", email: "donor@example.com", role: USER_ROLES.DONOR },
        errorResponse: null,
      });

      vi.spyOn(prisma.donation, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.donation, "count").mockResolvedValueOnce(0);

      const req = new Request("http://localhost:3000/api/donor/prayers");
      const res = await donorPrayersGetHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe("POST /api/donations/amin (Safe Clamp Anti-Negative Count)", () => {
    it("mencegah aminCount bernilai negatif saat aksi decrement berulang", async () => {
      vi.spyOn(prisma.donation, "findUnique").mockResolvedValueOnce({
        id: "don-amin-1",
        aminCount: 0,
      });

      const updateSpy = vi.spyOn(prisma.donation, "update").mockResolvedValueOnce({
        id: "don-amin-1",
        aminCount: 0,
      });

      const req = new Request("http://localhost:3000/api/donations/amin", {
        method: "POST",
        body: JSON.stringify({ donationId: "don-amin-1", action: "decrement" }),
      });

      const res = await aminPostHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.aminCount).toBe(0);

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { aminCount: 0 },
        })
      );
    });
  });
});
