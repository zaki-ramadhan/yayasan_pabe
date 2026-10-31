"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Trash2 } from "lucide-react";
import { uploadFileToServer, deleteFileFromServer } from "@/services/uploadService";
import { formatBytes } from "@/lib/formatters";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Sub-komponen modular: Kotak unggah berkas CV / Resume (PDF).
 * Murni fokus pada unggah berkas PDF langsung (tanpa toggle link rumit).
 * Mengikuti proporsi, tinggi, dan kenyamanan visual FileUploadZone di Admin Panel (min-h-[175px]).
 *
 * @param {object} props
 * @param {string} props.value - Tautan URL berkas tersimpan
 * @param {Function} props.onChange - Emisi URL berkas ke parent
 * @param {string} [props.error] - Pesan error validasi
 * @param {boolean} [props.disabled=false]
 */
export function CareerResumeUpload({
  value = "",
  onChange,
  error,
  disabled = false,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const displayFileName = value instanceof File ? value.name : (value ? (uploadedFileName || "Berkas CV terlampir (PDF)") : "");
  const displayFileSize = value instanceof File ? value.size : (value ? uploadedFileSize : 0);

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Format berkas harus PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Ukuran berkas CV maksimal 5MB.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setUploadProgress(0);
      setIsUploading(true);
      const res = await uploadFileToServer({
        file,
        context: "CAREER_RESUME",
        identifier: "applicant-cv",
        signal: controller.signal,
        onProgress: (pct) => setUploadProgress(pct),
      });

      if (res?.url) {
        if (value && typeof value === "string") {
          deleteFileFromServer(value);
        }
        onChange(res.url);
        setUploadedFileName(file.name);
        setUploadedFileSize(file.size);
        toast.success("Berkas CV berhasil diunggah.");
      }
    } catch (err) {
      if (controller.signal.aborted) {
        toast.info("Pengunggahan berkas CV dibatalkan.");
        return;
      }
      toast.error(err.message || "Gagal mengunggah berkas CV. Silakan coba lagi.");
    } finally {
      abortControllerRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    if (value && typeof value === "string") {
      deleteFileFromServer(value);
    }
    onChange("");
    setUploadedFileName("");
    setUploadedFileSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploaded = Boolean(value);

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-800 select-none">
          Berkas CV / resume <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs text-slate-500">Khusus berkas PDF (maks. 5MB)</span>
      </div>

      <div className="space-y-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {isUploaded ? (
          /* Tampilan Berkas Terunggah */
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {displayFileName || "Berkas CV terlampir (PDF)"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {displayFileSize > 0 ? formatBytes(displayFileSize) : "Dokumen PDF"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled || isUploading}
              title="Hapus dan ganti berkas"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Kotak Dropzone Seragam dengan Admin Panel (min-h-[175px]) */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!disabled && !isUploading && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={cn(
              "relative flex flex-col items-center justify-center py-7 px-5 min-h-[175px] sm:min-h-[185px] border-2 border-dashed rounded-xl cursor-pointer transition-all select-none text-center",
              isDragging
                ? "border-slate-500 bg-slate-100/70 scale-[0.99]"
                : error
                ? "border-rose-300 bg-rose-50/30"
                : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50",
              disabled
                ? "pointer-events-none opacity-80"
                : isUploading
                ? "cursor-default opacity-95"
                : ""
            )}
          >
            {isUploading ? (
              <UploadProgressBar
                progress={uploadProgress}
                isUploading={isUploading}
                isPdf={true}
                onCancel={handleCancelUpload}
                theme="slate"
              />
            ) : (
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  <span className="text-slate-800 font-semibold underline underline-offset-2">
                    Pilih berkas PDF
                  </span>{" "}
                  atau seret ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format PDF, ukuran maksimal 5MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && !isUploaded && (
        <p className="text-xs font-normal text-rose-600 mt-1">{error}</p>
      )}
    </div>
  );
}
