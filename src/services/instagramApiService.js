/**
 * BACKUP FILE: Logika Fetch Instagram via Live Meta Graph API
 *
 * File ini disimpan sebagai arsip cadangan siap pakai jika di masa mendatang
 * admin yayasan berhasil login kembali ke akun Instagram resmi dan ingin
 * mengaktifkan kembali penarikan otomatis melalui token API resmi.
 */

import { prisma } from "@/lib/prisma";
import { INSTAGRAM_ACCOUNT } from "@/data/instagramPosts";
import { formatDate } from "@/lib/formatters";

/**
 * Mengambil postingan murni langsung dari Meta Graph API menggunakan INSTAGRAM_ACCESS_TOKEN.
 * Fallback ke database PostgreSQL jika API offline atau token expired.
 *
 * @param {number} [limit=9]
 * @returns {Promise<Array>}
 */
export async function getLiveInstagramPosts(limit = 9) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (token) {
    try {
      const apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${token}`;
      const response = await fetch(apiUrl, {
        next: { revalidate: 1800 }, // Cache 30 menit
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mappedPosts = json.data.map((post, idx) => {
            const likes = typeof post.like_count === "number" ? post.like_count : 0;
            const comments = typeof post.comments_count === "number" ? post.comments_count : 0;
            const rawTimestamp = post.timestamp ? new Date(post.timestamp).getTime() : 0;

            return {
              id: post.id || `ig-live-${idx}`,
              imageUrl: post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url,
              alt: post.caption?.slice(0, 100) || "Postingan Instagram",
              caption: post.caption || "",
              timestamp: rawTimestamp,
              date: post.timestamp
                ? formatDate(post.timestamp, { month: "short" })
                : "",
              likes,
              comments,
              engagementScore: likes + comments,
              postUrl: post.permalink || (INSTAGRAM_ACCOUNT.profileUrl || "https://www.instagram.com/yayasanpayungberkah/"),
            };
          });

          // Urutkan berdasarkan tanggal terbaru (descending)
          mappedPosts.sort((a, b) => b.timestamp - a.timestamp);

          return mappedPosts.slice(0, Math.min(limit, 50));
        }
      }
    } catch (apiError) {
      console.warn("Instagram Live API fetch error:", apiError?.message);
    }
  }

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

  return [];
}

/**
 * Mengambil profil akun langsung dari Graph API v21.0.
 *
 * @returns {Promise<object>}
 */
export async function getLiveInstagramAccount() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (token) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type,media_count,profile_picture_url,followers_count,follows_count&access_token=${token}`,
        { next: { revalidate: 1800 } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          const rawFollowers = typeof data.followers_count === "number" ? data.followers_count : 0;
          const formattedFollowers =
            rawFollowers >= 1000000
              ? (rawFollowers / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
              : rawFollowers >= 1000
              ? (rawFollowers / 1000).toFixed(1).replace(/\.0$/, "") + "K"
              : rawFollowers.toString();

          return {
            username: data.username,
            handle: data.username,
            displayName: data.name || data.username,
            avatarUrl: data.profile_picture_url || null,
            profileUrl: `https://www.instagram.com/${data.username}/`,
            messageUrl: `https://ig.me/m/${data.username}`,
            followersCount: formattedFollowers,
            followingCount: typeof data.follows_count === "number" ? data.follows_count : 0,
            postsCount: typeof data.media_count === "number" ? data.media_count : 0,
            isVerified: false,
          };
        }
      }
    } catch (err) {
      console.warn("Instagram Profile API fetch warning:", err?.message);
    }
  }

  let dbCount = INSTAGRAM_ACCOUNT.postCount || 12;
  try {
    const count = await prisma.instagramPost.count();
    if (count > 0) dbCount = count;
  } catch {
    // ignore
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
    postsCount: dbCount,
    isVerified: false,
  };
}
