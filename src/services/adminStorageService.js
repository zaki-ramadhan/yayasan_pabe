import prisma from "@/lib/prisma";
import { listR2Objects, deleteMultipleFromR2, isR2Configured } from "@/lib/r2Storage";
import { extractR2Key } from "@/lib/r2KeyUtils";
import { isDirectVideoUrl, VIDEO_POSTER_SUFFIX } from "@/lib/galleryGroupHelper";
import {
  STORAGE_CONTEXTS,
  R2_FREE_TIER_BYTES,
  calculateStorageHealth,
} from "@/lib/storageConstants";

export { R2_FREE_TIER_BYTES };

// Default batas minimal umur berkas untuk proteksi grace period (0 = pindai semua berkas tak terpakai)
export const DEFAULT_ORPHAN_GRACE_HOURS = 0;

// Cache in-memory untuk efisiensi request S3 & anti-rate limit Class A
let cachedStorageOverview = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 menit

/**
 * Membatalkan cache ringkasan penyimpanan R2 agar kalkulasi berikutnya segar.
 */
export function invalidateStorageCache() {
  cachedStorageOverview = null;
  lastCacheTimestamp = 0;
}

/**
 * Mengambil ringkasan penggunaan penyimpanan Cloudflare R2 dan rincian per folder.
 * Mendukung in-memory cache TTL 3 menit untuk meminimalkan beban request Class A S3 API.
 * @param {object} [options]
 * @param {boolean} [options.forceRefresh=false]
 */
export async function getStorageOverview({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedStorageOverview && now - lastCacheTimestamp < CACHE_TTL_MS) {
    return cachedStorageOverview;
  }

  const mockPercent =
    process.env.MOCK_STORAGE_PERCENT !== undefined && process.env.MOCK_STORAGE_PERCENT !== ""
      ? Number(process.env.MOCK_STORAGE_PERCENT)
      : null;

  if (!isR2Configured() && mockPercent === null) {
    const health = calculateStorageHealth(0, R2_FREE_TIER_BYTES);
    return {
      isConfigured: false,
      totalBytes: 0,
      totalCount: 0,
      limitBytes: R2_FREE_TIER_BYTES,
      usagePercent: 0,
      health,
      folders: [],
    };
  }

  const { objects } = await listR2Objects({ maxKeys: 1000 });

  let totalBytes = 0;
  const folderStats = {};

  // Inisialisasi folder resmi dari STORAGE_CONTEXTS
  Object.values(STORAGE_CONTEXTS).forEach((ctx) => {
    folderStats[ctx.folder] = { folder: ctx.folder, count: 0, bytes: 0, files: [] };
  });

  objects.forEach((obj) => {
    totalBytes += obj.size;

    let matchedFolder = null;
    for (const ctx of Object.values(STORAGE_CONTEXTS)) {
      if (obj.key.startsWith(`${ctx.folder}/`)) {
        matchedFolder = ctx.folder;
        break;
      }
    }

    if (!matchedFolder) {
      const parts = obj.key.split("/");
      matchedFolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "root";
    }

    if (!folderStats[matchedFolder]) {
      folderStats[matchedFolder] = { folder: matchedFolder, count: 0, bytes: 0, files: [] };
    }

    folderStats[matchedFolder].count += 1;
    folderStats[matchedFolder].bytes += obj.size;
    const filename = obj.key.split("/").pop();
    folderStats[matchedFolder].files.push({
      key: obj.key,
      name: filename,
      size: obj.size,
      lastModified: obj.lastModified instanceof Date ? obj.lastModified.toISOString() : String(obj.lastModified || new Date().toISOString()),
      url: obj.url,
    });
  });

  // Urutkan berkas di dalam masing-masing folder berdasarkan waktu unggah terbaru
  Object.values(folderStats).forEach((f) => {
    f.files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  });

  // Jika mockPercent aktif dari environment, timpa totalBytes untuk simulasi QA
  if (mockPercent !== null && !isNaN(mockPercent)) {
    totalBytes = Math.round((mockPercent / 100) * R2_FREE_TIER_BYTES);
  }

  const health = calculateStorageHealth(totalBytes, R2_FREE_TIER_BYTES);

  const overview = {
    isConfigured: true,
    totalBytes,
    totalCount: objects.length,
    limitBytes: R2_FREE_TIER_BYTES,
    usagePercent: health.usagePercent,
    health,
    folders: Object.values(folderStats).sort((a, b) => b.bytes - a.bytes),
  };

  cachedStorageOverview = overview;
  lastCacheTimestamp = now;

  return overview;
}

/**
 * Mengumpulkan semua kunci (keys) berkas R2 yang saat ini aktif digunakan di database.
 * @returns {Promise<Set<string>>}
 */
export async function getReferencedStorageKeys() {
  const referencedKeys = new Set();

  const addKeys = (rawUrls) => {
    if (!rawUrls) return;
    const list = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
    list.forEach((url) => {
      if (typeof url === "string" && url.trim()) {
        const key = extractR2Key(url);
        if (key) {
          referencedKeys.add(key);
          if (isDirectVideoUrl(key)) {
            referencedKeys.add(`${key}${VIDEO_POSTER_SUFFIX}`);
          }
        }
      }
    });
  };

  try {
    const [
      galleryItems,
      articles,
      campaigns,
      campaignUpdates,
      auditReports,
      jobApplications,
      users,
      instagramPosts,
      instagramProfiles,
    ] = await Promise.all([
      prisma.galleryItem ? prisma.galleryItem.findMany({ select: { imageUrl: true } }) : [],
      prisma.article ? prisma.article.findMany({ select: { bannerUrl: true, content: true } }) : [],
      prisma.campaign ? prisma.campaign.findMany({ select: { bannerUrl: true } }) : [],
      prisma.campaignUpdate ? prisma.campaignUpdate.findMany({ select: { images: true } }) : [],
      prisma.auditReport ? prisma.auditReport.findMany({ select: { pdfUrl: true } }) : [],
      prisma.jobApplication ? prisma.jobApplication.findMany({ select: { resumeUrl: true } }) : [],
      prisma.user ? prisma.user.findMany({ select: { avatar: true, customAvatar: true } }) : [],
      prisma.instagramPost ? prisma.instagramPost.findMany({ select: { imageUrl: true } }) : [],
      prisma.instagramProfile ? prisma.instagramProfile.findMany({ select: { avatarUrl: true } }) : [],
    ]);

    galleryItems.forEach((g) => addKeys(g.imageUrl));
    articles.forEach((a) => {
      addKeys(a.bannerUrl);
      if (a.content) {
        const matches = a.content.matchAll(/(?:src=["']|url\(["']?)([^"')]+)/gi);
        for (const m of matches) {
          addKeys(m[1]);
        }
      }
    });
    campaigns.forEach((c) => addKeys(c.bannerUrl));
    campaignUpdates.forEach((u) => addKeys(u.images));
    auditReports.forEach((r) => addKeys(r.pdfUrl));
    jobApplications.forEach((j) => addKeys(j.resumeUrl));
    users.forEach((u) => {
      addKeys(u.avatar);
      addKeys(u.customAvatar);
    });
    instagramPosts.forEach((ig) => addKeys(ig.imageUrl));
    instagramProfiles.forEach((ip) => addKeys(ip.avatarUrl));
  } catch (err) {
    console.error("Gagal membaca referensi berkas dari database:", err.message);
  }

  return referencedKeys;
}

/**
 * Memindai berkas tak terpakai (Orphan Files) di Cloudflare R2 dengan filter usia berkas.
 *
 * @param {{ minAgeHours?: number }} [options]
 */
export async function scanOrphanFiles({ minAgeHours = DEFAULT_ORPHAN_GRACE_HOURS } = {}) {
  if (!isR2Configured()) {
    return {
      orphans: [],
      totalOrphans: 0,
      totalOrphanBytes: 0,
    };
  }

  const [referencedKeys, { objects }] = await Promise.all([
    getReferencedStorageKeys(),
    listR2Objects({ maxKeys: 1000 }),
  ]);

  const now = Date.now();
  const minAgeMs = Number(minAgeHours) * 60 * 60 * 1000;
  const orphans = [];
  let totalOrphanBytes = 0;

  objects.forEach((obj) => {
    // 1. Jika terdaftar di database, berkas aktif -> BUKAN sampah
    if (referencedKeys.has(obj.key)) return;

    // 2. Proteksi Grace Period (hanya jika minAgeHours > 0)
    const modifiedTime = new Date(obj.lastModified).getTime();
    const ageMs = Math.max(0, now - modifiedTime);
    if (minAgeHours > 0 && ageMs < minAgeMs) return;

    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    const folder = obj.key.includes("/") ? obj.key.split("/")[0] : "root";

    orphans.push({
      key: obj.key,
      url: obj.url,
      size: obj.size,
      lastModified: obj.lastModified,
      ageHours,
      ageMinutes,
      folder,
    });
    totalOrphanBytes += obj.size;
  });

  return {
    orphans: orphans.sort((a, b) => b.size - a.size),
    totalOrphans: orphans.length,
    totalOrphanBytes,
  };
}

/**
 * Mengeksekusi penghapusan permanen berkas sampah dari R2 setelah verifikasi ganda.
 *
 * @param {string[]} targetKeys
 * @param {{ userId?: string, userName?: string }} [adminMeta]
 */
export async function cleanupOrphanFiles(targetKeys = [], adminMeta = {}) {
  if (!Array.isArray(targetKeys) || targetKeys.length === 0) {
    throw new Error("Daftar berkas yang akan dihapus tidak boleh kosong.");
  }

  // Safety Gate: Verifikasi ganda bahwa tidak ada kunci yang sedang aktif di database
  const referencedKeys = await getReferencedStorageKeys();
  const safeKeysToDelete = targetKeys.filter((key) => !referencedKeys.has(key));

  if (safeKeysToDelete.length === 0) {
    return {
      success: true,
      deletedCount: 0,
      message: "Tidak ada berkas yang aman dihapus (seluruh berkas masih dirujuk oleh database).",
    };
  }

  const deleteResult = await deleteMultipleFromR2(safeKeysToDelete);

  // Catat ke log aktivitas admin
  if (prisma.activityLog) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: adminMeta.userId || null,
          userName: adminMeta.userName || "Admin",
          userRole: "ADMIN",
          action: "DELETE_ORPHAN_FILES",
          targetType: "CLOUDFLARE_R2",
          description: `Membersihkan ${deleteResult.deletedCount} berkas sampah di Cloudflare R2.`,
        },
      });
    } catch (logErr) {
      console.warn("Gagal mencatat ActivityLog penghapusan R2:", logErr.message);
    }
  }

  if (deleteResult.deletedCount > 0) {
    invalidateStorageCache();
  }

  return {
    success: deleteResult.success,
    deletedCount: deleteResult.deletedCount,
    errors: deleteResult.errors,
  };
}

/**
 * Membersihkan berkas CV/resume pelamar pekerjaan yang berstatus REJECTED
 * dan telah melewati masa retensi (default 90 hari) dari Cloudflare R2,
 * serta memperbarui referensi database menjadi null.
 *
 * @param {object} [options]
 * @param {number} [options.retentionDays=90] - Batas usia berkas pelamar ditolak dalam hari
 * @param {{ userId?: string, userName?: string }} [adminMeta]
 * @returns {Promise<{ success: boolean, cleanedCount: number, deletedKeys: string[] }>}
 */
export async function cleanupStaleRejectedResumes({ retentionDays = 90 } = {}, adminMeta = {}) {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const staleApps = await prisma.jobApplication.findMany({
    where: {
      status: "REJECTED",
      createdAt: { lte: cutoffDate },
      resumeUrl: { not: null },
    },
    select: { id: true, resumeUrl: true },
  });

  if (!staleApps.length) {
    return {
      success: true,
      cleanedCount: 0,
      deletedKeys: [],
      message: "Tidak ada berkas pelamar ditolak yang melampaui masa retensi.",
    };
  }

  const keysToDelete = staleApps
    .map((app) => extractR2Key(app.resumeUrl))
    .filter(Boolean);

  let deletedCount = 0;
  if (keysToDelete.length > 0 && isR2Configured()) {
    const delRes = await deleteMultipleFromR2(keysToDelete);
    deletedCount = delRes.deletedCount;
  }

  const appIds = staleApps.map((a) => a.id);
  await prisma.jobApplication.updateMany({
    where: { id: { in: appIds } },
    data: { resumeUrl: null },
  });

  if (prisma.activityLog) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: adminMeta.userId || null,
          userName: adminMeta.userName || "System Retention",
          userRole: "ADMIN",
          action: "CLEANUP_STALE_RESUMES",
          targetType: "JOB_APPLICATION",
          description: `Membersihkan ${staleApps.length} berkas CV pelamar ditolak yang berusia lebih dari ${retentionDays} hari.`,
        },
      });
    } catch (logErr) {
      console.warn("Gagal mencatat ActivityLog cleanup resumes:", logErr.message);
    }
  }

  invalidateStorageCache();

  return {
    success: true,
    cleanedCount: staleApps.length,
    deletedKeys: keysToDelete,
  };
}
