import { describe, it, expect } from "vitest";
import { resolveUserAvatar } from "@/lib/userParser";

describe("resolveUserAvatar - SSOT Avatar Resolution", () => {
  it("mengembalikan null jika user bernilai null, undefined, atau bukan objek", () => {
    expect(resolveUserAvatar(null)).toBeNull();
    expect(resolveUserAvatar(undefined)).toBeNull();
    expect(resolveUserAvatar("string")).toBeNull();
    expect(resolveUserAvatar(123)).toBeNull();
  });

  it("memprioritaskan customAvatar di atas providerAvatar dan avatar preset generic", () => {
    const user = {
      customAvatar: "https://r2.storage/custom.webp",
      providerAvatar: "https://lh3.googleusercontent.com/google.jpg",
      avatar: "/avatars/male.svg",
    };
    expect(resolveUserAvatar(user)).toBe("https://r2.storage/custom.webp");
  });

  it("memprioritaskan customAvatar jika avatar aktif tertimpa foto Google providerAvatar", () => {
    const user = {
      avatar: "https://lh3.googleusercontent.com/a/google-photo.jpg",
      customAvatar: "/api/media/users/avatars/user-avatar_custom.webp",
      providerAvatar: "https://lh3.googleusercontent.com/a/google-photo.jpg",
    };
    expect(resolveUserAvatar(user)).toBe("/api/media/users/avatars/user-avatar_custom.webp");
  });

  it("memprioritaskan avatar karakter lokal yang dipilih pengguna di atas customAvatar", () => {
    const user = {
      avatar: "/img/avatars/avatar-male-1.webp",
      customAvatar: "https://r2.storage/custom.webp",
      providerAvatar: "https://lh3.googleusercontent.com/google.jpg",
    };
    expect(resolveUserAvatar(user)).toBe("/img/avatars/avatar-male-1.webp");
  });

  it("mengambil providerAvatar (Google/OAuth) jika customAvatar tidak ada dan avatar masih generic", () => {
    const user = {
      customAvatar: null,
      providerAvatar: "https://lh3.googleusercontent.com/google.jpg",
      avatar: "/avatars/male.svg",
    };
    expect(resolveUserAvatar(user)).toBe("https://lh3.googleusercontent.com/google.jpg");
  });

  it("mengambil avatar jika customAvatar dan providerAvatar kosong", () => {
    const user = {
      customAvatar: "",
      providerAvatar: null,
      avatar: "https://images.unsplash.com/preset.jpg",
    };
    expect(resolveUserAvatar(user)).toBe("https://images.unsplash.com/preset.jpg");
  });

  it("mendukung alias avatarUrl, image, dan picture", () => {
    expect(resolveUserAvatar({ avatarUrl: "https://img.com/url.png" })).toBe("https://img.com/url.png");
    expect(resolveUserAvatar({ image: "https://img.com/image.png" })).toBe("https://img.com/image.png");
    expect(resolveUserAvatar({ picture: "https://img.com/picture.png" })).toBe("https://img.com/picture.png");
  });

  it("mengabaikan string kosong dan whitespace", () => {
    const user = {
      customAvatar: "   ",
      providerAvatar: "",
      avatar: "https://img.com/valid.jpg",
    };
    expect(resolveUserAvatar(user)).toBe("https://img.com/valid.jpg");
  });

  describe("Admin Routine Donation Service Integration", () => {
    it("menautkan Google providerAvatar ke relasi donasi rutin donatur", async () => {
      const { getAdminRoutineDonations } = await import("@/services/adminRoutineDonationService");
      const prismaModule = (await import("@/lib/prisma")).default;

      vi.spyOn(prismaModule.routineDonation, "count").mockResolvedValueOnce(1);
      vi.spyOn(prismaModule.routineDonation, "findMany").mockResolvedValueOnce([
        {
          id: "rd-1",
          programTitle: "Sedekah Subuh",
          campaignId: null,
          campaign: null,
          amount: 50000,
          frequency: "DAILY",
          routineType: "INFAK_SUBUH",
          status: "ACTIVE",
          selectedDay: null,
          monthlyDate: null,
          reminderTime: "05:00",
          donorName: "Budi Santoso",
          donorEmail: "budi@gmail.com",
          donorPhone: "081234567890",
          isAnonymous: false,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
        },
      ]);
      vi.spyOn(prismaModule.user, "findMany").mockResolvedValueOnce([
        {
          email: "budi@gmail.com",
          phone: "081234567890",
          avatar: null,
          customAvatar: null,
          providerAvatar: "https://lh3.googleusercontent.com/budi-google.png",
        },
      ]);

      const res = await getAdminRoutineDonations({ page: 1, limit: 10 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].donorAvatar).toBe("https://lh3.googleusercontent.com/budi-google.png");
      expect(res.items[0].avatar).toBe("https://lh3.googleusercontent.com/budi-google.png");
      expect(res.items[0].avatarUrl).toBe("https://lh3.googleusercontent.com/budi-google.png");
    });
  });
});
