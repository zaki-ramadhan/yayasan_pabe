import { toast } from "@/hooks/useToast";
import { extractVideoMetadata } from "@/lib/videoHelper";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_DURATION_SECONDS = 60; // 60s limit
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function getResolvedAccept(accept, isPdf, allowVideo) {
  if (accept) return accept;
  if (isPdf) return "application/pdf";
  if (allowVideo) {
    return "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";
  }
  return "image/jpeg,image/png,image/webp";
}

export function getResolvedHelperText(helperText, isPdf, allowVideo) {
  if (helperText) return helperText;
  if (isPdf) {
    return "Mendukung format PDF resmi (Maks. 15MB). Disimpan aman di cloud.";
  }
  if (allowVideo) {
    return "JPG, PNG, WebP (Maks. 10MB), Video MP4/WebM (Maks. 1 video, 25MB, 60 dtk), Bisa tempel via Ctrl + V";
  }
  return "Mendukung format JPEG, PNG, dan WebP (Maks. 10MB) terkonversi otomatis ke WebP, bisa tempel via Ctrl + V";
}

export function validateSingleFile(file, { isPdf, resolvedAccept }) {
  if (!file) return { isValid: false };

  const maxBytes = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxBytes) {
    toast({
      variant: "warning",
      title: "Ukuran berkas terlalu besar",
      description: `Batas maksimal ukuran berkas adalah ${Math.round(maxBytes / (1024 * 1024))}MB.`,
    });
    return { isValid: false };
  }

  if (resolvedAccept) {
    const allowedList = resolvedAccept.split(",").map((t) => t.trim().toLowerCase());
    const fileType = (file.type || "").toLowerCase();
    const fileExt = `.${(file.name || "").split(".").pop()}`.toLowerCase();
    const isAllowed = allowedList.some((allowed) => {
      if (allowed.startsWith(".")) return fileExt === allowed;
      if (allowed.endsWith("/*")) {
        const baseType = allowed.split("/")[0];
        return fileType.startsWith(`${baseType}/`);
      }
      return fileType === allowed;
    });

    if (!isAllowed) {
      toast({
        variant: "destructive",
        title: "Format berkas tidak didukung",
        description: isPdf
          ? "Format berkas harus berupa dokumen PDF."
          : "Format berkas harus berupa gambar (JPG, PNG, atau WebP).",
      });
      return { isValid: false };
    }
  }

  return { isValid: true };
}

export async function processMultiUploadFiles(fileList, { allowVideo, existingFiles, onProgressText }) {
  const validFiles = [];
  let oversizedImageCount = 0;
  let invalidTypeCount = 0;
  const hasExistingVideo = existingFiles.some((f) => f.isVideo);
  let hasNewVideoInBatch = false;

  const fileArray = Array.from(fileList || []);
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const typeLower = (file.type || "").toLowerCase();
    const isVideo =
      ALLOWED_VIDEO_TYPES.includes(typeLower) ||
      Boolean(file.name.match(/\.(mp4|webm|mov)$/i));
    const isImage =
      ALLOWED_IMAGE_TYPES.includes(typeLower) ||
      Boolean(file.name.match(/\.(jpe?g|png|webp)$/i));

    if (!isImage && (!allowVideo || !isVideo)) {
      invalidTypeCount++;
      continue;
    }

    if (isVideo && allowVideo) {
      if (hasExistingVideo || hasNewVideoInBatch) {
        toast({
          variant: "warning",
          title: "Batas 1 video per kegiatan",
          description:
            "Setiap kegiatan dibatasi maksimal 1 video sorotan. Untuk video tambahan atau berdurasi panjang, gunakan kolom tautan YouTube.",
        });
        continue;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        toast({
          variant: "warning",
          title: "Ukuran video melebihi 25MB",
          description:
            "Video dilewati karena melebihi batas 25MB. Silakan kompres video atau masukkan tautan YouTube.",
        });
        continue;
      }

      if (onProgressText) onProgressText(`Memeriksa video (${file.name})...`);
      const meta = await extractVideoMetadata(file);

      if (meta.duration > MAX_VIDEO_DURATION_SECONDS) {
        toast({
          variant: "warning",
          title: "Durasi video melebihi 60 detik",
          description: `Durasi video ini (${Math.round(meta.duration)} detik) melebihi batas maksimal 60 detik. Disarankan menggunakan tautan YouTube.`,
        });
        continue;
      }

      hasNewVideoInBatch = true;
      validFiles.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        thumbnailUrl: meta.thumbnailUrl,
        isVideo: true,
        duration: meta.duration,
        durationFormatted: meta.durationFormatted,
      });
      continue;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      oversizedImageCount++;
      continue;
    }

    validFiles.push({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      isVideo: false,
    });
  }

  if (invalidTypeCount > 0) {
    toast({
      variant: "warning",
      title: "Format berkas dilewati",
      description: `${invalidTypeCount} berkas bukan format yang didukung.`,
    });
  }

  if (oversizedImageCount > 0) {
    toast({
      variant: "warning",
      title: "Ukuran foto melebihi batas",
      description: `${oversizedImageCount} foto dilewati karena melebihi batas 10MB per foto.`,
    });
  }

  return validFiles;
}

export function sanitizeAndValidateManualUrl(rawInput, { isPdf }) {
  let clean = rawInput.trim();
  if (!clean) {
    toast({
      variant: "warning",
      title: "Tautan tidak boleh kosong",
      description: "Silakan masukkan alamat tautan yang valid.",
    });
    return null;
  }

  if (clean.includes("drive.google.com")) {
    toast({
      variant: "warning",
      title: "Tautan Google Drive tidak didukung",
      description: "Google Drive bukan berkas langsung. Silakan unduh dan unggah langsung berkasnya.",
    });
    return null;
  }

  if (!isPdf && (clean.includes("youtube.com") || clean.includes("youtu.be"))) {
    toast({
      variant: "warning",
      title: "Tautan YouTube bukan berkas gambar",
      description: "Untuk video YouTube, gunakan kolom khusus tautan video YouTube.",
    });
    return null;
  }

  if (
    !clean.startsWith("http://") &&
    !clean.startsWith("https://") &&
    !clean.startsWith("/") &&
    !clean.startsWith("data:")
  ) {
    toast({
      variant: "warning",
      title: "Format tautan tidak valid",
      description: "Tautan harus diawali dengan http://, https://, atau jalur direktori lokal /",
    });
    return null;
  }

  if (isPdf && !clean.toLowerCase().includes(".pdf") && !clean.startsWith("/")) {
    toast({
      variant: "warning",
      title: "Bukan tautan dokumen PDF",
      description: "Pastikan tautan mengarah langsung ke berkas dokumen berformat .pdf",
    });
    return null;
  }

  if (clean.startsWith("//")) {
    clean = "https:" + clean;
  } else if (clean.startsWith("images?q=") || clean.startsWith("/images?q=")) {
    clean = "https://encrypted-tbn0.gstatic.com" + (clean.startsWith("/") ? "" : "/") + clean;
  } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\//.test(clean) && !clean.startsWith("http")) {
    clean = "https://" + clean;
  }

  if (clean.includes("google.") && clean.includes("imgurl=")) {
    try {
      const parsed = new URL(clean);
      const extracted = parsed.searchParams.get("imgurl");
      if (extracted) clean = decodeURIComponent(extracted);
    } catch {
      const match = clean.match(/[?&]imgurl=([^&]+)/);
      if (match?.[1]) clean = decodeURIComponent(match[1]);
    }
  }

  return clean;
}

