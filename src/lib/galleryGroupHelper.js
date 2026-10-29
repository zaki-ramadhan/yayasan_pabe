import { decodeHtmlEntities } from "@/lib/formatters";

/**
 * Mengekstrak ID video YouTube dari berbagai variasi URL (watch, shorts, embed, youtu.be).
 *
 * @param {string} url - Tautan YouTube
 * @returns {string|null} ID 11 karakter video YouTube atau null jika tidak cocok
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Memeriksa apakah URL merupakan tautan video YouTube yang valid.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  return Boolean(getYouTubeVideoId(url));
}

/**
 * Menghasilkan URL thumbnail resmi beresolusi tinggi dari video YouTube.
 *
 * @param {string} url
 * @returns {string|null} URL gambar cover YouTube (hqdefault.jpg)
 */
export function getYouTubeThumbnail(url) {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Memeriksa apakah sebuah URL mengarah langsung ke berkas media video (MP4, WebM, MOV, dll).
 *
 * @param {string} url - URL berkas media
 * @returns {boolean} True jika berkas adalah video langsung
 */
export function isDirectVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".m4v") ||
    clean.includes("/video/")
  );
}

/**
 * Memeriksa apakah sebuah URL mengarah ke file media video atau penyedia video (R2/YouTube/Vimeo).
 *
 * @param {string} url - URL berkas media
 * @returns {boolean} True jika berkas adalah video
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  return isDirectVideoUrl(url) || isYouTubeUrl(url) || url.toLowerCase().includes("vimeo.com");
}

/**
 * Mengelompokkan daftar foto/video galeri tunggal menjadi entitas koleksi/album kegiatan.
 * Menggabungkan media yang memiliki judul dan kategori kegiatan yang sama ke dalam satu kartu koleksi.
 * Memprioritaskan video sebagai cover/media utama jika dokumentasi tersebut memiliki video.
 *
 * @param {Array<object>} items - Daftar item galeri dari API / database
 * @returns {Array<object>} Daftar koleksi galeri dengan media utama, 3 thumbnail, dan total aset media.
 */
export function groupGalleryItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const groupsMap = new Map();

  items.forEach((item) => {
    // Normalisasi kunci pengelompokan berdasarkan judul & kategori kegiatan serta decode HTML entities
    const rawTitle = decodeHtmlEntities((item.title || "Dokumentasi kegiatan").trim());
    const rawCat = decodeHtmlEntities((item.category || "Umum").trim());
    const titleKey = rawTitle.toLowerCase();
    const catKey = rawCat.toLowerCase();
    const groupKey = `${titleKey}__${catKey}`;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: item.id,
        title: rawTitle,
        category: rawCat,
        description: item.description ? decodeHtmlEntities(item.description) : null,
        activityDate: item.activityDate,
        createdAt: item.createdAt,
        images: item.imageUrl ? [item.imageUrl] : [],
        rawItems: [item],
      });
    } else {
      const existing = groupsMap.get(groupKey);
      if (item.imageUrl && !existing.images.includes(item.imageUrl)) {
        existing.images.push(item.imageUrl);
        existing.rawItems.push(item);
      }
      // Prioritaskan deskripsi jika item awal belum memiliki deskripsi
      if (!existing.description && item.description) {
        existing.description = decodeHtmlEntities(item.description);
      }
    }
  });

  return Array.from(groupsMap.values()).map((group) => {
    const rawImages = group.images || [];

    // Prioritaskan video sebagai cover utama (indeks 0) jika ada video dalam dokumentasi
    const firstVideoIndex = rawImages.findIndex((url) => isVideoUrl(url));
    let orderedImages = [...rawImages];

    if (firstVideoIndex > 0) {
      const [videoUrl] = orderedImages.splice(firstVideoIndex, 1);
      orderedImages.unshift(videoUrl);
    }

    const rawMain = orderedImages[0] || "/img/branding/logo-ypabe.webp";
    const mainImage = isYouTubeUrl(rawMain) ? getYouTubeThumbnail(rawMain) : rawMain;
    const hasVideo = rawImages.some((url) => isVideoUrl(url));
    const mainIsVideo = isVideoUrl(rawMain);

    return {
      ...group,
      images: orderedImages,
      totalCount: orderedImages.length,
      mainImage,
      hasVideo,
      mainIsVideo,
      thumbnails: orderedImages.slice(1, 4).map((u) => (isYouTubeUrl(u) ? getYouTubeThumbnail(u) : u)),
    };
  });
}
