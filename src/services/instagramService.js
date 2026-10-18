import { prisma } from "@/lib/prisma";
import { INSTAGRAM_POSTS, INSTAGRAM_ACCOUNT } from "@/data/instagramPosts";

/**
 * Mengambil postingan murni langsung dari akun Instagram yang terhubung.
 * Mengurutkan berdasarkan tanggal postingan terbaru, dan dibatasi maksimal 9 postingan.
 */
export async function getInstagramPosts(limit = 9) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return [];
  }

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
              ? new Date(post.timestamp).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "",
            likes,
            comments,
            engagementScore: likes + comments,
            postUrl: post.permalink || `https://www.instagram.com/`,
          };
        });

        // Urutkan berdasarkan tanggal terbaru (descending)
        mappedPosts.sort((a, b) => b.timestamp - a.timestamp);

        // Kembalikan postingan sesuai limit yang diminta
        return mappedPosts.slice(0, Math.min(limit, 50));
      }
    }
  } catch (apiError) {
    console.warn("Instagram Live API fetch error:", apiError?.message);
  }

  return [];
}

export async function getInstagramAccount() {
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

  return {
    username: (INSTAGRAM_ACCOUNT.username || "yayasanpabe").replace("@", ""),
    handle: (INSTAGRAM_ACCOUNT.username || "yayasanpabe").replace("@", ""),
    displayName: INSTAGRAM_ACCOUNT.displayName || "Yayasan PABE",
    avatarUrl: null,
    profileUrl: INSTAGRAM_ACCOUNT.profileUrl || "https://www.instagram.com",
    messageUrl: "https://www.instagram.com/direct/inbox/",
    followersCount: INSTAGRAM_ACCOUNT.followersCount || "14.8K",
    followingCount: INSTAGRAM_ACCOUNT.followingCount || 120,
    postsCount: INSTAGRAM_ACCOUNT.postCount || 384,
    isVerified: false,
  };
}

