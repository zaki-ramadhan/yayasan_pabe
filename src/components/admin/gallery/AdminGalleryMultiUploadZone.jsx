"use client";

import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";

/**
 * Adapter kompatibilitas yang mendelegasikan seluruh interaksi multi-upload
 * ke komponen terpadu FileUploadZone (DRY & SOLID).
 */
export function AdminGalleryMultiUploadZone({
  label = "Foto dan video sorotan kegiatan",
  required = false,
  selectedFiles = [],
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  isUploading = false,
  uploadProgressText = "",
  error = "",
}) {
  return (
    <FileUploadZone
      multiple={true}
      allowVideo={true}
      files={selectedFiles}
      onFilesChange={(newFiles) => {
        if (onAddFiles) onAddFiles(newFiles);
      }}
      label={label}
      required={required}
      isUploading={isUploading}
      uploadProgressText={uploadProgressText}
      error={error}
    />
  );
}
