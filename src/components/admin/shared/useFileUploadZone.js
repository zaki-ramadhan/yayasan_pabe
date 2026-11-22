"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "@/hooks/useToast";
import { uploadFileToServer, deleteFileFromServer } from "@/services/uploadService";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_PDF_SIZE,
  MAX_VIDEO_DURATION_SECONDS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  getResolvedAccept,
  getResolvedHelperText,
  validateSingleFile,
  processMultiUploadFiles,
  sanitizeAndValidateManualUrl,
} from "./fileUploadUtils";

export {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_PDF_SIZE,
  MAX_VIDEO_DURATION_SECONDS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};

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

  const [prevVal, setPrevVal] = useState(value);
  if (!value && prevVal) {
    setPrevVal(value);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    setUploadMeta(null);
  } else if (value !== prevVal) {
    setPrevVal(value);
  }

  const resolvedAccept = getResolvedAccept(accept, isPdf, allowVideo);
  const resolvedHelperText = getResolvedHelperText(helperText, isPdf, allowVideo);

  const handleProcessMultipleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setInternalIsUploading(true);
    setInternalProgressText("Memeriksa berkas...");

    try {
      const validFiles = await processMultiUploadFiles(fileList, {
        allowVideo,
        existingFiles: files,
        onProgressText: setInternalProgressText,
      });

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

  const handleSingleFileSelect = async (file) => {
    if (!file) return;

    const validation = validateSingleFile(file, { isPdf, resolvedAccept });
    if (!validation.isValid) return;

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
          size: data.size || 0,
          mimeType: data.mimeType,
        });
        if (onUploadSuccess) onUploadSuccess(data.url);

        toast({
          variant: "success",
          title: "Berhasil diunggah",
          description: isPdf
            ? "Dokumen PDF berhasil disimpan."
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
        }
      }
    });
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

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
    const clean = sanitizeAndValidateManualUrl(manualInput, { isPdf });
    if (!clean) return;

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
