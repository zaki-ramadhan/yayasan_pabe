"use client";

import { useState, useRef } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { uploadFileToServer } from "@/services/uploadService";
import { formatDuration } from "@/lib/formatters";
import { FileUploadPreview } from "./FileUploadPreview";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { FileUploadMultiPreview } from "./FileUploadMultiPreview";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_DURATION_SECONDS = 60; // 60s limit
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
  });
}

/**
 * Komponen koordinator terpusat unggah berkas ke Cloudflare R2.
 * Menjamin bentuk, tinggi, dan proporsi kotak attach file seragam di seluruh modal.
 * Mendukung mode berkas tunggal (Program, Artikel, Laporan Audit, Edit Galeri)
 * dan mode berkas jamak / batch (Galeri Tambah Baru).
 */
export function FileUploadZone({
  value = "",
  onChange,
  files = [],
  onFilesChange,
  multiple = false,
  allowVideo = false,
  context = "ARTICLE_BANNER",
  identifier = "",
  label = "Foto sampul / banner",
  required = false,
  helperText,
  accept,
  isPdf = false,
  isUploading: parentIsUploading,
  uploadProgressText = "",
  error = "",
}) {
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualUrl, setIsManualUrl] = useState(false);
  const [manualInput, setManualInput] = useState(value || "");
  const [localPreview, setLocalPreview] = useState("");
  const [uploadMeta, setUploadMeta] = useState(null);
  const fileInputRef = useRef(null);

  const isUploading = Boolean(parentIsUploading || internalIsUploading);

  const defaultAccept = isPdf
    ? "application/pdf"
    : allowVideo
    ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp";

  const resolvedAccept = accept || defaultAccept;

  const defaultHelperText = isPdf
    ? "Mendukung format PDF resmi (Maks. 15MB). Otomatis disimpan ke Cloudflare R2."
    : allowVideo
    ? "JPG, PNG, WebP (Maks. 5MB) • Video MP4/WebM (Maks. 1 video, 25MB, 60 dtk)"
    : "Mendukung format JPEG, PNG, dan WebP (Maks. 5MB). Otomatis dikonversi ke WebP.";

  const resolvedHelperText = helperText || defaultHelperText;

  // Penanganan Berkas Mode Multi / Batch
  const handleProcessMultipleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    let oversizedImageCount = 0;
    let invalidTypeCount = 0;
    const hasExistingVideo = files.some((f) => f.isVideo);
    let hasNewVideoInBatch = false;

    for (const file of Array.from(fileList)) {
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
              "Untuk efisiensi penyimpanan Cloudflare R2, setiap kegiatan dibatasi maksimal 1 video sorotan. Untuk video tambahan atau berdurasi panjang, gunakan kolom tautan YouTube.",
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

        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
          toast({
            variant: "warning",
            title: "Durasi video melebihi 60 detik",
            description: `Durasi video ini (${Math.round(duration)} detik) melebihi batas maksimal 60 detik. Disarankan menggunakan tautan YouTube.`,
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
          isVideo: true,
          duration,
          durationFormatted: formatDuration(duration),
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
        description: `${oversizedImageCount} foto dilewati karena melebihi batas 5MB per foto.`,
      });
    }

    if (validFiles.length > 0 && onFilesChange) {
      onFilesChange([...files, ...validFiles]);
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

    try {
      setInternalIsUploading(true);
      const data = await uploadFileToServer({
        file,
        context,
        identifier,
      });

      if (data?.url) {
        if (onChange) onChange(data.url);
        setManualInput(data.url);
        setUploadMeta({
          savingsPercent: data.savingsPercent || 0,
          sizeKb: Math.round((data.size || 0) / 1024),
          mimeType: data.mimeType,
        });

        toast({
          variant: "success",
          title: "Berhasil diunggah",
          description: isPdf
            ? "Dokumen PDF berhasil disimpan ke penyimpanan Cloudflare R2."
            : data.savingsPercent
            ? `Berkas berhasil dioptimasi (hemat ${data.savingsPercent}%).`
            : "Berkas berhasil disimpan ke Cloudflare R2.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Gagal mengunggah",
        description: err.message || "Terjadi kesalahan saat mengunggah berkas.",
      });
    } finally {
      setInternalIsUploading(false);
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
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveSingle = () => {
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
    if (onFilesChange) {
      onFilesChange(files.filter((f) => f.id !== fileId));
    }
  };

  const handleClearMultiFiles = () => {
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-900 select-none">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        {!multiple && (
          <button
            type="button"
            onClick={() => setIsManualUrl(!isManualUrl)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            {isManualUrl
              ? "Unggah berkas"
              : isPdf
              ? "Gunakan tautan dokumen"
              : "Gunakan tautan gambar"}
          </button>
        )}
      </div>

      <div className={error ? "rounded-lg ring-1 ring-rose-500/80 p-0.5" : ""}>
        {isManualUrl && !multiple ? (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={isPdf ? "https://... atau /documents/laporan-audit.pdf" : "https://... atau /img/..."}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyManual();
                }
              }}
              className="h-10 text-sm bg-white"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyManual}
              className="h-10 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Terapkan
            </Button>
          </div>
        ) : !multiple && value ? (
          <FileUploadPreview
            value={value}
            previewSrc={localPreview || value}
            isPdf={isPdf}
            uploadMeta={uploadMeta}
            isUploading={isUploading}
            onReplace={() => {
              if (
                typeof value === "string" &&
                !value.includes(".r2.dev") &&
                !value.startsWith("/api/media/") &&
                !localPreview
              ) {
                setIsManualUrl(true);
              } else {
                fileInputRef.current?.click();
              }
            }}
            onRemove={handleRemoveSingle}
          />
        ) : (
          <div className="space-y-2.5">
            <FileUploadDropzone
              isDragging={isDragging}
              isUploading={isUploading}
              uploadProgressText={uploadProgressText}
              isPdf={isPdf}
              multiple={multiple}
              hasFiles={multiple && files.length > 0}
              helperText={resolvedHelperText}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />

            {multiple && files.length > 0 && (
              <FileUploadMultiPreview
                files={files}
                onRemoveFile={handleRemoveMultiFile}
                onClearFiles={handleClearMultiFiles}
                isUploading={isUploading}
              />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium leading-relaxed" role="alert">
          {error}
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={resolvedAccept}
        onChange={(e) => {
          if (multiple) {
            handleProcessMultipleFiles(e.target.files);
          } else {
            const file = e.target.files?.[0];
            if (file) handleSingleFileSelect(file);
          }
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
