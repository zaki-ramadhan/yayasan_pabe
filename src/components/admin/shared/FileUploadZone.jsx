"use client";

import { useState, useRef } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { uploadFileToServer } from "@/services/uploadService";
import { FileUploadPreview } from "./FileUploadPreview";
import { FileUploadDropzone } from "./FileUploadDropzone";

/**
 * Komponen koordinator unggah berkas ke Cloudflare R2.
 * Memisahkan tanggung jawab visual ke sub-komponen FileUploadPreview dan FileUploadDropzone,
 * serta menyerahkan komunikasi jaringan ke uploadService.
 */
export function FileUploadZone({
  value = "",
  onChange,
  context = "ARTICLE_BANNER",
  identifier = "",
  label = "Foto sampul / banner",
  helperText = "Mendukung format JPEG, PNG, dan WebP (Maks. 5MB). Otomatis dikonversi ke WebP.",
  accept = "image/jpeg,image/png,image/webp",
  isPdf = false,
  error = "",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualUrl, setIsManualUrl] = useState(false);
  const [manualInput, setManualInput] = useState(value || "");
  const [uploadMeta, setUploadMeta] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Pre-flight client validation ukuran berkas
    const maxBytes = isPdf ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: "Ukuran berkas terlalu besar",
        description: `Batas maksimal ukuran berkas adalah ${Math.round(maxBytes / (1024 * 1024))}MB.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const data = await uploadFileToServer({
        file,
        context,
        identifier,
      });

      if (data?.url) {
        onChange(data.url);
        setManualInput(data.url);
        setUploadMeta({
          savingsPercent: data.savingsPercent || 0,
          sizeKb: Math.round((data.size || 0) / 1024),
          mimeType: data.mimeType,
        });

        toast({
          title: "Berhasil diunggah",
          description: data.savingsPercent
            ? `Berkas berhasil dioptimasi (hemat ${data.savingsPercent}%).`
            : "Berkas berhasil disimpan ke penyimpanan Cloudflare R2.",
        });
      }
    } catch (err) {
      toast({
        title: "Gagal mengunggah",
        description: err.message || "Terjadi kesalahan saat mengunggah berkas.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
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

  const handleRemove = () => {
    onChange("");
    setManualInput("");
    setUploadMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyManual = () => {
    const trimmed = manualInput.trim();
    onChange(trimmed);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsManualUrl(!isManualUrl)}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          {isManualUrl ? "Gunakan upload berkas" : "Input URL manual"}
        </button>
      </div>

      <div className={error ? "rounded-lg ring-1 ring-rose-500/80 p-0.5" : ""}>
        {isManualUrl ? (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://... atau /img/..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="h-10 text-sm bg-white"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyManual}
              className="h-10 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Terapkan
            </Button>
          </div>
        ) : value ? (
          <FileUploadPreview
            value={value}
            isPdf={isPdf}
            uploadMeta={uploadMeta}
            isUploading={isUploading}
            onReplace={() => fileInputRef.current?.click()}
            onRemove={handleRemove}
          />
        ) : (
          <FileUploadDropzone
            isDragging={isDragging}
            isUploading={isUploading}
            isPdf={isPdf}
            helperText={helperText}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          />
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
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}
