import prisma from "@/lib/prisma";
import { INSTAGRAM_ACCOUNT } from "@/data/instagramPosts";
import { parseThousandsToNumber } from "@/lib/formatters";
import { sanitizeInput } from "@/lib/sanitizer";

export async function getAdminInstagramPosts({ search = "", page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const where = {};
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { caption: { contains: q, mode: "insensitive" } },
      { altText: { contains: q, mode: "insensitive" } },
    ];
  }

  if (!prisma.instagramPost) {
    return {
      items: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 1,
    };
  }

  const [total, items] = await Promise.all([
    prisma.instagramPost.count({ where }),
    prisma.instagramPost.findMany({
      where,
      orderBy: { postedAt: "desc" },
      skip,
      take: safeLimit,
    }),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

export async function getAdminInstagramProfile() {
  try {
    const profile = await prisma.instagramProfile.findUnique({
      where: { id: "ig_profile" },
    });

    if (profile) return profile;
  } catch (err) {
    console.warn("getAdminInstagramProfile fallback warning:", err?.message);
  }

  return {
    id: "ig_profile",
    username: (INSTAGRAM_ACCOUNT.username || "yayasanpayungberkah").replace("@", ""),
    displayName: INSTAGRAM_ACCOUNT.displayName || "Yayasan Payung Berkah",
    avatarUrl: null,
    bio: INSTAGRAM_ACCOUNT.bio || "",
    profileUrl: INSTAGRAM_ACCOUNT.profileUrl || "https://www.instagram.com/yayasanpayungberkah/",
    followersCount: String(INSTAGRAM_ACCOUNT.followersCount || "186"),
    followingCount: INSTAGRAM_ACCOUNT.followingCount || 385,
    isVerified: false,
  };
}

export async function updateAdminInstagramProfile(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Data profil Instagram tidak valid.");
  }

  const existing = await getAdminInstagramProfile();

  const username = data.username !== undefined
    ? sanitizeInput(data.username).replace("@", "").trim()
    : existing.username;

  const displayName = data.displayName !== undefined
    ? sanitizeInput(data.displayName).trim()
    : existing.displayName;

  const avatarUrl = data.avatarUrl !== undefined
    ? (data.avatarUrl && typeof data.avatarUrl === "string" && data.avatarUrl.trim() ? data.avatarUrl.trim() : null)
    : existing.avatarUrl;

  const bio = data.bio !== undefined
    ? (data.bio ? sanitizeInput(data.bio).trim() : null)
    : existing.bio;

  const profileUrl = data.profileUrl && typeof data.profileUrl === "string" && data.profileUrl.trim()
    ? data.profileUrl.trim()
    : `https://www.instagram.com/${username}/`;

  const rawFollowers = data.followersCount !== undefined && data.followersCount !== null
    ? String(data.followersCount).trim()
    : existing.followersCount;

  const followingCount = data.followingCount !== undefined && data.followingCount !== null
    ? parseThousandsToNumber(data.followingCount)
    : existing.followingCount;

  const isVerified = data.isVerified !== undefined
    ? Boolean(data.isVerified)
    : existing.isVerified;

  return prisma.instagramProfile.upsert({
    where: { id: "ig_profile" },
    update: {
      username,
      displayName,
      avatarUrl,
      bio,
      profileUrl,
      followersCount: rawFollowers,
      followingCount,
      isVerified,
    },
    create: {
      id: "ig_profile",
      username,
      displayName,
      avatarUrl,
      bio,
      profileUrl,
      followersCount: rawFollowers,
      followingCount,
      isVerified,
    },
  });
}

export async function createInstagramPost(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Data postingan Instagram tidak valid.");
  }

  const imageUrl = data.imageUrl && typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
  if (!imageUrl) {
    throw new Error("Gambar postingan Instagram wajib diunggah.");
  }

  const caption = sanitizeInput(data.caption || "").trim();
  const altText = data.altText ? sanitizeInput(data.altText).trim() : caption.slice(0, 100);
  const postUrl = data.postUrl && typeof data.postUrl === "string" && data.postUrl.trim()
    ? data.postUrl.trim()
    : "https://www.instagram.com";

  const likeCount = parseThousandsToNumber(data.likeCount);
  const commentCount = parseThousandsToNumber(data.commentCount);
  const postedAt = data.postedAt ? new Date(data.postedAt) : new Date();

  return prisma.instagramPost.create({
    data: {
      imageUrl,
      caption,
      altText,
      postUrl,
      likeCount,
      commentCount,
      postedAt,
    },
  });
}

export async function updateInstagramPost(id, data) {
  if (!id) throw new Error("ID postingan tidak valid.");
  if (!data || typeof data !== "object") {
    throw new Error("Data postingan Instagram tidak valid.");
  }

  const updateData = {};
  if (data.imageUrl !== undefined) {
    const img = String(data.imageUrl).trim();
    if (!img) throw new Error("Gambar postingan tidak boleh kosong.");
    updateData.imageUrl = img;
  }
  if (data.caption !== undefined) {
    updateData.caption = sanitizeInput(data.caption).trim();
  }
  if (data.altText !== undefined) {
    updateData.altText = sanitizeInput(data.altText).trim();
  }
  if (data.postUrl !== undefined) {
    updateData.postUrl = String(data.postUrl).trim() || "https://www.instagram.com";
  }
  if (data.likeCount !== undefined) {
    updateData.likeCount = parseThousandsToNumber(data.likeCount);
  }
  if (data.commentCount !== undefined) {
    updateData.commentCount = parseThousandsToNumber(data.commentCount);
  }
  if (data.postedAt !== undefined) {
    updateData.postedAt = new Date(data.postedAt);
  }

  return prisma.instagramPost.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteInstagramPost(id) {
  if (!id) throw new Error("ID postingan tidak valid.");
  return prisma.instagramPost.delete({
    where: { id },
  });
}
