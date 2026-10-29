import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getInstagramPosts, getInstagramAccount } from "@/services/instagramService";
import {
  createInstagramPost,
  updateAdminInstagramProfile,
} from "@/services/adminInstagramService";
import { INSTAGRAM_ACCOUNT, INSTAGRAM_POSTS } from "@/data/instagramPosts";

describe("Instagram Manual CMS & Service Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstagramPosts", () => {
    it("mengembalikan postingan dari database saat tersedia", async () => {
      const mockDbPosts = [
        {
          id: "post-1",
          caption: "Bantuan Pangan Dhuafa",
          imageUrl: "https://r2.pabe.or.id/instagram/ig-media-1.webp",
          altText: "Bantuan Pangan",
          postUrl: "https://www.instagram.com/p/test1",
          likeCount: 1500,
          commentCount: 45,
          postedAt: new Date("2026-10-01T10:00:00Z"),
          createdAt: new Date("2026-10-01T10:00:00Z"),
        },
      ];

      vi.spyOn(prisma.instagramPost, "findMany").mockResolvedValue(mockDbPosts);

      const posts = await getInstagramPosts(5);
      expect(posts.length).toBe(1);
      expect(posts[0].id).toBe("post-1");
      expect(posts[0].caption).toBe("Bantuan Pangan Dhuafa");
      expect(posts[0].likes).toBe(1500);
      expect(posts[0].comments).toBe(45);
      expect(posts[0].engagementScore).toBe(1545);
    });

    it("menggunakan fallback data statis jika database kosong", async () => {
      vi.spyOn(prisma.instagramPost, "findMany").mockResolvedValue([]);

      const posts = await getInstagramPosts(3);
      expect(posts.length).toBe(3);
      expect(posts[0].id).toBe(INSTAGRAM_POSTS[0].id);
    });
  });

  describe("getInstagramAccount", () => {
    it("mengembalikan profil tersimpan dari database jika tersedia", async () => {
      const mockProfile = {
        id: "ig_profile",
        username: "yayasanpayungberkah",
        displayName: "Yayasan Payung Berkah Resmi",
        avatarUrl: "https://r2.pabe.or.id/users/avatars/ig-avatar.webp",
        bio: "Hidup Berkah dengan Sedekah",
        profileUrl: "https://www.instagram.com/yayasanpayungberkah/",
        followersCount: "2500",
        followingCount: 410,
        isVerified: true,
      };

      vi.spyOn(prisma.instagramProfile, "findUnique").mockResolvedValue(mockProfile);
      vi.spyOn(prisma.instagramPost, "count").mockResolvedValue(15);

      const account = await getInstagramAccount();
      expect(account.username).toBe("yayasanpayungberkah");
      expect(account.displayName).toBe("Yayasan Payung Berkah Resmi");
      expect(account.avatarUrl).toBe("https://r2.pabe.or.id/users/avatars/ig-avatar.webp");
      expect(account.followersCount).toBe("2500");
      expect(account.postsCount).toBe(15);
      expect(account.isVerified).toBe(true);
    });

    it("menggunakan fallback akun default jika profil belum disimpan di database", async () => {
      vi.spyOn(prisma.instagramProfile, "findUnique").mockResolvedValue(null);
      vi.spyOn(prisma.instagramPost, "count").mockResolvedValue(0);

      const account = await getInstagramAccount();
      expect(account.displayName).toBe(INSTAGRAM_ACCOUNT.displayName);
      expect(account.followersCount).toBe(String(INSTAGRAM_ACCOUNT.followersCount));
    });
  });

  describe("createInstagramPost validation & formatting", () => {
    it("menolak jika imageUrl kosong", async () => {
      await expect(
        createInstagramPost({ imageUrl: "", caption: "Test" })
      ).rejects.toThrow(/gambar postingan instagram wajib/i);
    });

    it("berhasil memparsing nilai string berpemisah ribuan ke integer murni", async () => {
      const createSpy = vi.spyOn(prisma.instagramPost, "create").mockImplementation(async ({ data }) => ({
        id: "new-id",
        ...data,
      }));

      await createInstagramPost({
        imageUrl: "https://example.com/test.jpg",
        caption: "Caption Test",
        likeCount: "10.000",
        commentCount: "1.250",
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            likeCount: 10000,
            commentCount: 1250,
          }),
        })
      );
    });

    it("otomatis mengisi likeCount dan commentCount dengan 0 jika tidak disertakan", async () => {
      const createSpy = vi.spyOn(prisma.instagramPost, "create").mockImplementation(async ({ data }) => ({
        id: "new-id",
        ...data,
      }));

      await createInstagramPost({
        imageUrl: "https://example.com/test.jpg",
        caption: "Dokumentasi Tanpa Angka",
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            likeCount: 0,
            commentCount: 0,
          }),
        })
      );
    });
  });

  describe("updateAdminInstagramProfile validation & formatting", () => {
    it("membersihkan prefix @ pada username dan memparsing followingCount", async () => {
      const upsertSpy = vi.spyOn(prisma.instagramProfile, "upsert").mockImplementation(async ({ update }) => ({
        id: "ig_profile",
        ...update,
      }));

      await updateAdminInstagramProfile({
        username: "@yayasanpayungberkah_baru",
        displayName: "Yayasan PABE",
        followersCount: "15.000",
        followingCount: "500",
      });

      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            username: "yayasanpayungberkah_baru",
            displayName: "Yayasan PABE",
            followingCount: 500,
          }),
        })
      );
    });

    it("memperbarui avatarUrl dan mempertahankan field yang tidak diubah", async () => {
      vi.spyOn(prisma.instagramProfile, "findUnique").mockResolvedValue({
        id: "ig_profile",
        username: "yayasanpayungberkah",
        displayName: "Yayasan Payung Berkah",
        avatarUrl: null,
        bio: "Sedekah Berkah",
        profileUrl: "https://www.instagram.com/yayasanpayungberkah/",
        followersCount: "186",
        followingCount: 385,
        isVerified: false,
      });

      const upsertSpy = vi.spyOn(prisma.instagramProfile, "upsert").mockImplementation(async ({ update }) => ({
        id: "ig_profile",
        ...update,
      }));

      await updateAdminInstagramProfile({
        avatarUrl: "https://r2.pabe.or.id/users/avatars/new-avatar.webp",
      });

      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            avatarUrl: "https://r2.pabe.or.id/users/avatars/new-avatar.webp",
            username: "yayasanpayungberkah",
            displayName: "Yayasan Payung Berkah",
            followersCount: "186",
            followingCount: 385,
          }),
        })
      );
    });
  });

  describe("getAdminInstagramProfile", () => {
    it("mengembalikan default account jika profil belum pernah diubah di database", async () => {
      vi.spyOn(prisma.instagramProfile, "findUnique").mockResolvedValue(null);
      const { getAdminInstagramProfile } = await import("@/services/adminInstagramService");
      const profile = await getAdminInstagramProfile();
      expect(profile.id).toBe("ig_profile");
      expect(profile.username).toBe(INSTAGRAM_ACCOUNT.username.replace("@", ""));
    });
  });

  describe("deleteInstagramPostsBulk", () => {
    it("berhasil menghapus banyak postingan berdasarkan array ID", async () => {
      const deleteManySpy = vi
        .spyOn(prisma.instagramPost, "deleteMany")
        .mockResolvedValue({ count: 2 });
      const { deleteInstagramPostsBulk } = await import("@/services/adminInstagramService");

      const result = await deleteInstagramPostsBulk(["post-1", "post-2"]);
      expect(deleteManySpy).toHaveBeenCalledWith({
        where: { id: { in: ["post-1", "post-2"] } },
      });
      expect(result.count).toBe(2);
    });

    it("menolak penghapusan jika array ID kosong atau tidak valid", async () => {
      const { deleteInstagramPostsBulk } = await import("@/services/adminInstagramService");
      await expect(deleteInstagramPostsBulk([])).rejects.toThrow(/wajib disertakan/i);
      await expect(deleteInstagramPostsBulk(["   "])).rejects.toThrow(/tidak ada id/i);
    });
  });
});

