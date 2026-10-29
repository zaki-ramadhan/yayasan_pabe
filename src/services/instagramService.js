import { prisma } from "@/lib/prisma";
import { INSTAGRAM_ACCOUNT, INSTAGRAM_POSTS } from "@/data/instagramPosts";
import { formatDate } from "@/lib/formatters";
import {
  getLiveInstagramPosts,
  getLiveInstagramAccount,
} from "./instagramApiService";

/**
 * Mengambil daftar postingan Instagram.
 * Jika INSTAGRAM_SOURCE_MODE="api" dan token terkonfigurasi, mengambil via Meta Graph API.
 * Secara default, mengambil langsung dari database CMS PostgreSQL secara manual.
 *
 * @param {number} [limit=9]
 * @returns {Promise<Array>}
 */
export async function getInstagramPosts(limit = 9) {
  if (process.env.INSTAGRAM_SOURCE_MODE === "api" && process.env.INSTAGRAM_ACCESS_TOKEN) {
    try {
      const livePosts = await getLiveInstagramPosts(limit);
      if (livePosts && livePosts.length > 0) return livePosts;
    } catch (err) {
      console.warn("Live API fallback to DB:", err.message);
    }
  }

  if (prisma.instagramPost) {
    try {
      const dbPosts = await prisma.instagramPost.findMany({
        orderBy: { postedAt: "desc" },
        take: limit || 12,
      });

      if (dbPosts && dbPosts.length > 0) {
        return dbPosts.map((post) => {
          const rawTimestamp = post.postedAt ? new Date(post.postedAt).getTime() : 0;
          return {
            id: post.id,
            imageUrl: post.imageUrl,
            alt: post.altText || post.caption?.slice(0, 100) || "Postingan Instagram",
            caption: post.caption || "",
            timestamp: rawTimestamp,
            date: post.postedAt
              ? formatDate(post.postedAt, { month: "short" })
              : "",
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            engagementScore: (post.likeCount || 0) + (post.commentCount || 0),
            postUrl: post.postUrl || (INSTAGRAM_ACCOUNT.profileUrl || "https://www.instagram.com/yayasanpayungberkah/"),
          };
        });
      }
    } catch (dbError) {
      console.warn("Prisma getInstagramPosts fallback error:", dbError?.message);
    }
  }

  // Fallback data lokal jika database belum terisi postingan
  return INSTAGRAM_POSTS.slice(0, limit).map((post) => ({
    ...post,
    engagementScore: (post.likes || 0) + (post.comments || 0),
    timestamp: post.date ? new Date(post.date).getTime() : 0,
  }));
}

/**
 * Mengambil profil akun Instagram yayasan.
 * Jika INSTAGRAM_SOURCE_MODE="api", mengambil via Graph API.
 * Secara default, mengambil dari database PostgreSQL atau data fallback profil.
 *
 * @returns {Promise<object>}
 */
export async function getInstagramAccount() {
  if (process.env.INSTAGRAM_SOURCE_MODE === "api" && process.env.INSTAGRAM_ACCESS_TOKEN) {
    try {
      const liveAccount = await getLiveInstagramAccount();
      if (liveAccount) return liveAccount;
    } catch (err) {
      console.warn("Live Account API fallback to DB:", err.message);
    }
  }

  let dbProfile = null;
  let dbCount = 0;

  if (prisma.instagramProfile && prisma.instagramPost) {
    try {
      const [profile, count] = await Promise.all([
        prisma.instagramProfile.findUnique({
          where: { id: "ig_profile" },
        }),
        prisma.instagramPost.count(),
      ]);
      dbProfile = profile;
      dbCount = count;
    } catch (err) {
      console.warn("Prisma getInstagramAccount fallback warning:", err?.message);
    }
  }

  if (dbProfile) {
    return {
      username: dbProfile.username.replace("@", ""),
      handle: dbProfile.username.replace("@", ""),
      displayName: dbProfile.displayName,
      avatarUrl: dbProfile.avatarUrl,
      profileUrl: dbProfile.profileUrl,
      messageUrl: `https://ig.me/m/${dbProfile.username.replace("@", "")}`,
      followersCount: dbProfile.followersCount,
      followingCount: dbProfile.followingCount,
      postsCount: dbCount || INSTAGRAM_ACCOUNT.postCount || 12,
      isVerified: dbProfile.isVerified,
    };
  }

  return {
    username: (INSTAGRAM_ACCOUNT.username || "yayasanpayungberkah").replace("@", ""),
    handle: (INSTAGRAM_ACCOUNT.username || "yayasanpayungberkah").replace("@", ""),
    displayName: INSTAGRAM_ACCOUNT.displayName || "Yayasan Payung Berkah",
    avatarUrl: null,
    profileUrl: INSTAGRAM_ACCOUNT.profileUrl || "https://www.instagram.com/yayasanpayungberkah/",
    messageUrl: "https://www.instagram.com/direct/inbox/",
    followersCount: String(INSTAGRAM_ACCOUNT.followersCount || "186"),
    followingCount: INSTAGRAM_ACCOUNT.followingCount || 385,
    postsCount: dbCount || INSTAGRAM_ACCOUNT.postCount || 12,
    isVerified: false,
  };
}
