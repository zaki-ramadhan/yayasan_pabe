"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "@/hooks/useToast";
import { uploadFileToServer, deleteFileFromServer } from "@/services/uploadService";
import { extractVideoMetadata } from "@/lib/videoHelper";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_DURATION_SECONDS = 60; // 60s limit
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/**
 * Hook kustom untuk orkestrasi status dan operasi unggah berkas Cloudflare R2.
 * Menangani pemilihan berkas tunggal, batch upload, validasi format/ukuran/durasi,
 * drag-and-drop, serta penempelan gambar dari clipboard (Ctrl + V).
 */
export function useFileUploadZone({
  value = "",
  onChange,
  files = [],
  onFilesChange,
  multiple = false,
  allowVideo = false,
  context = "ARTICLE_BANNER",
  identifier = "",
  helperText,
  accept,
  isPdf = false,
  isUploading: parentIsUploading,
  uploadProgress: parentUploadProgress = 0,
  uploadProgressText = "",
  onUploadSuccess,
  onFileDelete,
}) {
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const [internalUploadProgress, setInternalUploadProgress] = useState(0);
  const [internalProgressText, setInternalProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isManualUrl, setIsManualUrl] = useState(false);
  const [manualInput, setManualInput] = useState(value || "");
  const [localPreview, setLocalPreview] = useState("");
  const [uploadMeta, setUploadMeta] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const stagedUrlsRef = useRef(new Set());
  const isCommittedRef = useRef(false);

  const commitUploads = useCallback(() => {
    isCommittedRef.current = true;
    stagedUrlsRef.current.clear();
  }, []);

  const discardStagedUploads = useCallback(() => {
    if (stagedUrlsRef.current.size > 0 && !isCommittedRef.current) {
      const urls = Array.from(stagedUrlsRef.current);
      deleteFileFromServer(urls);
      stagedUrlsRef.current.clear();
    }
  }, []);

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const isUploading = Boolean(parentIsUploading || internalIsUploading);
  const uploadProgress = parentIsUploading
    ? Number(parentUploadProgress) || 0
    : internalUploadProgress;
  const progressText = uploadProgressText || internalProgressText;

  // Sinkronisasi status preview saat value dibersihkan
  useEffect(() => {
    if (!value) {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview("");
      }
      setUploadMeta(null);
    }
  }, [value, localPreview]);

  const defaultAccept = isPdf
    ? "application/pdf"
    : allowVideo
    ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp";

  const resolvedAccept = accept || defaultAccept;

  const defaultHelperText = isPdf
    ? "Mendukung format PDF resmi (Maks. 15MB). Disimpan aman di cloud."
    : allowVideo
    ? "JPG, PNG, WebP (Maks. 10MB) • Video MP4/WebM (Maks. 1 video, 25MB, 60 dtk) • Bisa Ctrl + V"
    : "Mendukung format JPEG, PNG, dan WebP (Maks. 10MB). Otomatis dikonversi ke WebP • Bisa Ctrl + V";

  const resolvedHelperText = helperText || defaultHelperText;

  // Penanganan Berkas Mode Multi / Batch
  const handleProcessMultipleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setInternalIsUploading(true);
    setInternalProgressText("Membaca dan memvalidasi berkas...");

    try {
      const validFiles = [];
      let oversizedImageCount = 0;
      let invalidTypeCount = 0;
      const hasExistingVideo = files.some((f) => f.isVideo);
      let hasNewVideoInBatch = false;

      const fileArray = Array.from(fileList);
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

          setInternalProgressText(`Menganalisis durasi dan pratinjau video (${file.name})...`);
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

      if (validFiles.length > 0 && onFilesChange) {
        onFilesChange([...files, ...validFiles]);
      }
    } finally {
      setInternalIsUploading(false);
      setInternalProgressText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Penanganan Berkas Mode Tunggal
  const handleSingleFileSelect = async (file) => {
    if (!file) return;

    const maxBytes = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxBytes) {
      toast({
        variant: "warning",
        title: "Ukuran berkas terlalu besar",
        description: `Batas maksimal ukuran berkas adalah ${Math.round(maxBytes / (1024 * 1024))}MB.`,
      });
      return;
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
        return;
      }
    }

    if (!isPdf && file.type?.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setInternalUploadProgress(0);
      setInternalIsUploading(true);
      const data = await uploadFileToServer({
        file,
        context,
        identifier,
        signal: controller.signal,
        onProgress: (pct) => setInternalUploadProgress(pct),
      });

      if (data?.url) {
        // Hapus berkas sementara sebelumnya jika pengguna mengganti berkas di sesi modal yang sama
        if (value && typeof value === "string" && stagedUrlsRef.current.has(value)) {
          deleteFileFromServer(value);
          stagedUrlsRef.current.delete(value);
        }
        stagedUrlsRef.current.add(data.url);

        if (onChange) onChange(data.url);
        setManualInput(data.url);
        setUploadMeta({
          savingsPercent: data.savingsPercent || 0,
          sizeKb: Math.round((data.size || 0) / 1024),
          mimeType: data.mimeType,
        });
        if (onUploadSuccess) onUploadSuccess(data.url);

        toast({
          variant: "success",
          title: "Berhasil diunggah",
          description: isPdf
            ? "Dokumen PDF berhasil disimpan."
            : data.savingsPercent
            ? `Berkas berhasil dioptimasi (hemat ${data.savingsPercent}%).`
            : "Berkas berhasil disimpan.",
        });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        toast({
          title: "Pengunggahan dibatalkan",
          description: "Proses unggah berkas telah dihentikan.",
        });
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
          setLocalPreview("");
        }
        return;
      }
      toast({
        variant: "destructive",
        title: "Gagal mengunggah",
        description: err.message || "Terjadi kesalahan saat mengunggah berkas.",
      });
    } finally {
      abortControllerRef.current = null;
      setInternalIsUploading(false);
      setInternalUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    if (multiple) {
      if (e.dataTransfer.files) {
        handleProcessMultipleFiles(e.dataTransfer.files);
      }
    } else {
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        handleSingleFileSelect(droppedFile);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveSingle = () => {
    if (value && typeof value === "string") {
      if (stagedUrlsRef.current.has(value)) {
        deleteFileFromServer(value);
        stagedUrlsRef.current.delete(value);
      }
      if (onFileDelete) onFileDelete(value);
    }
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    if (onChange) onChange("");
    setManualInput("");
    setUploadMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMultiFile = (fileId) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    if (fileToRemove?.previewUrl) {
      try {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      } catch {
        // Abaikan
      }
    }
    if (onFilesChange) {
      onFilesChange(files.filter((f) => f.id !== fileId));
    }
  };

  const handleClearMultiFiles = () => {
    files.forEach((f) => {
      if (f.previewUrl) {
        try {
          URL.revokeObjectURL(f.previewUrl);
        } catch {
          // Abaikan
        }
      }
    });
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

  // Penanganan Penempelan Berkas dari Clipboard (Ctrl + V)
  const pasteHandlerRef = useRef(null);
  useEffect(() => {
    pasteHandlerRef.current = (pastedFiles) => {
      if (!pastedFiles || pastedFiles.length === 0) return;
      toast({
        variant: "default",
        title: "Gambar terdeteksi dari clipboard",
        description: `Menempel ${pastedFiles.length} gambar ke formulir...`,
      });
      if (multiple) {
        handleProcessMultipleFiles(pastedFiles);
      } else {
        handleSingleFileSelect(pastedFiles[0]);
      }
    };
  });

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const targetTag = document.activeElement?.tagName?.toLowerCase();
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        pasteHandlerRef.current?.(pastedFiles);
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, []);

  const handleApplyManual = () => {
    let clean = manualInput.trim();
    if (!clean) {
      toast({
        variant: "warning",
        title: "Tautan tidak boleh kosong",
        description: "Silakan masukkan alamat tautan yang valid.",
      });
      return;
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

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }

    setManualInput(clean);
    if (onChange) onChange(clean);
    setIsManualUrl(false);
    toast({
      variant: "success",
      title: isPdf ? "Tautan dokumen diterapkan" : "Tautan gambar diterapkan",
      description: "Tautan eksternal berhasil digunakan.",
    });
  };

  return {
    fileInputRef,
    isUploading,
    uploadProgress,
    progressText,
    isDragging,
    isManualUrl,
    setIsManualUrl,
    manualInput,
    setManualInput,
    localPreview,
    uploadMeta,
    resolvedAccept,
    resolvedHelperText,
    handleSingleFileSelect,
    handleProcessMultipleFiles,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveSingle,
    handleRemoveMultiFile,
    handleClearMultiFiles,
    handleApplyManual,
    handleCancelUpload,
    commitUploads,
    discardStagedUploads,
    stagedUrlsRef,
  };
}
