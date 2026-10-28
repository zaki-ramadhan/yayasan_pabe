import prisma from "@/lib/prisma";
import { listR2Objects, deleteMultipleFromR2, isR2Configured } from "@/lib/r2Storage";
import { extractR2Key } from "@/lib/r2KeyUtils";
import { STORAGE_CONTEXTS } from "@/lib/storageConstants";

// Batas kuota gratis Cloudflare R2 bulanan (10 Gigabytes)
export const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024;

// Default batas minimal umur berkas untuk proteksi grace period (0 = pindai semua berkas tak terpakai)
export const DEFAULT_ORPHAN_GRACE_HOURS = 0;

/**
 * Mengambil ringkasan penggunaan penyimpanan Cloudflare R2 dan rincian per folder.
 */
export async function getStorageOverview() {
  if (!isR2Configured()) {
    return {
      isConfigured: false,
      totalBytes: 0,
      totalCount: 0,
      limitBytes: R2_FREE_TIER_BYTES,
      usagePercent: 0,
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

  const usagePercent = Math.min(100, Number(((totalBytes / R2_FREE_TIER_BYTES) * 100).toFixed(2)));

  return {
    isConfigured: true,
    totalBytes,
    totalCount: objects.length,
    limitBytes: R2_FREE_TIER_BYTES,
    usagePercent,
    folders: Object.values(folderStats).sort((a, b) => b.bytes - a.bytes),
  };
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
        if (key) referencedKeys.add(key);
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
    ] = await Promise.all([
      prisma.galleryItem ? prisma.galleryItem.findMany({ select: { imageUrl: true } }) : [],
      prisma.article ? prisma.article.findMany({ select: { bannerUrl: true, content: true } }) : [],
      prisma.campaign ? prisma.campaign.findMany({ select: { bannerUrl: true } }) : [],
      prisma.campaignUpdate ? prisma.campaignUpdate.findMany({ select: { images: true } }) : [],
      prisma.auditReport ? prisma.auditReport.findMany({ select: { pdfUrl: true } }) : [],
      prisma.jobApplication ? prisma.jobApplication.findMany({ select: { resumeUrl: true } }) : [],
      prisma.user ? prisma.user.findMany({ select: { avatar: true, coverImage: true } }) : [],
      prisma.instagramPost ? prisma.instagramPost.findMany({ select: { imageUrl: true } }) : [],
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
      addKeys(u.coverImage);
    });
    instagramPosts.forEach((ig) => addKeys(ig.imageUrl));
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

  return {
    success: deleteResult.success,
    deletedCount: deleteResult.deletedCount,
    errors: deleteResult.errors,
  };
}
