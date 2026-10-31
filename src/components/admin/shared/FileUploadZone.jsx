"use client";

import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUploadPreview } from "./FileUploadPreview";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { FileUploadMultiPreview } from "./FileUploadMultiPreview";
import { useFileUploadZone } from "./useFileUploadZone";

/**
 * Komponen koordinator terpusat unggah berkas ke Cloudflare R2.
 * Menjamin bentuk, tinggi, dan proporsi kotak attach file seragam di seluruh modal.
 * Mendukung mode berkas tunggal (Program, Artikel, Laporan Audit, Edit Galeri)
 * dan mode berkas jamak / batch (Galeri Tambah Baru).
 *
 * Menerapkan prinsip Separation of Concerns: Logika upload, validasi berkas,
 * dan event handlers didelegasikan ke hook `useFileUploadZone`.
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
  uploadProgress: parentUploadProgress = 0,
  uploadProgressText = "",
  error = "",
  onUploadSuccess,
  onFileDelete,
}) {
  const {
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
  } = useFileUploadZone({
    value,
    onChange,
    files,
    onFilesChange,
    multiple,
    allowVideo,
    context,
    identifier,
    helperText,
    accept,
    isPdf,
    isUploading: parentIsUploading,
    uploadProgress: parentUploadProgress,
    uploadProgressText,
    onUploadSuccess,
    onFileDelete,
  });

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
              placeholder={
                isPdf
                  ? "https://... atau /documents/laporan-audit.pdf"
                  : "https://... atau /img/..."
              }
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
              uploadProgress={uploadProgress}
              uploadProgressText={progressText}
              isPdf={isPdf}
              multiple={multiple}
              hasFiles={multiple && files.length > 0}
              helperText={resolvedHelperText}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onCancel={handleCancelUpload}
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
