"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { AdminGalleryMetadataFields } from "./AdminGalleryMetadataFields";
import { uploadFileToServer } from "@/services/uploadService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/formatters";
import { DEFAULT_GALLERY_CATEGORY } from "@/lib/galleryConstants";
import { isYouTubeUrl } from "@/lib/galleryGroupHelper";

/**
 * Modal coordinator untuk tambah banyak foto/video (Batch) dan edit tunggal dokumentasi galeri.
 * Memisahkan form metadata dan dropzone multi-file ke sub-komponen terisolasi (SRP).
 */
export function AdminGalleryModal({
  isOpen,
  onOpenChange,
  itemToEdit = null,
  categories = [],
  onSuccess,
}) {
  const isEditing = Boolean(itemToEdit);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(DEFAULT_GALLERY_CATEGORY);
  const [createdCategories, setCreatedCategories] = useState([]);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [singleImageUrl, setSingleImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Progress & Error State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  const categoryList = useMemo(() => {
    const rawList = Array.from(
      new Set([
        ...categories.filter((c) => c && c !== "Semua Kategori" && c !== "ALL"),
        ...createdCategories,
      ])
    );

    return rawList.map((name) => ({
      id: name,
      label: name,
      name,
    }));
  }, [categories, createdCategories]);

  useEffect(() => {
    setErrors({});
    setUploadProgressText("");
    if (itemToEdit) {
      setTitle(itemToEdit.title || "");
      setCategory(itemToEdit.category || DEFAULT_GALLERY_CATEGORY);
      setActivityDate(
        itemToEdit.activityDate
          ? itemToEdit.activityDate.slice(0, 10)
          : new Date().toISOString().split("T")[0]
      );
      const isYt = isYouTubeUrl(itemToEdit.imageUrl || "");
      setSingleImageUrl(isYt ? "" : itemToEdit.imageUrl || "");
      setYoutubeUrl(isYt ? itemToEdit.imageUrl || "" : "");
      setDescription(itemToEdit.description || "");
      setSelectedFiles([]);
    } else {
      setTitle("");
      setCategory(DEFAULT_GALLERY_CATEGORY);
      setActivityDate(new Date().toISOString().split("T")[0]);
      setSingleImageUrl("");
      setYoutubeUrl("");
      setDescription("");
      setSelectedFiles([]);
    }
  }, [itemToEdit, isOpen]);

  const handleCreateCategory = (name) => {
    const formatted = toTitleCase(name);
    if (!formatted) return;

    if (!createdCategories.includes(formatted)) {
      setCreatedCategories((prev) => [...prev, formatted]);
    }
    setCategory(formatted);
    toast.success(`Kategori "${formatted}" berhasil ditambahkan.`);
    return { id: formatted, label: formatted, name: formatted };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const cleanYt = youtubeUrl ? youtubeUrl.trim() : "";
    const hasYoutube = cleanYt.length > 0;

    if (hasYoutube && !isYouTubeUrl(cleanYt)) {
      newErrors.images = "Tautan YouTube tidak valid. Gunakan format https://www.youtube.com/watch?v=... atau https://youtu.be/...";
    }

    if (isEditing) {
      if (!singleImageUrl && !hasYoutube) {
        newErrors.images = "Foto atau tautan video YouTube dokumentasi wajib disertakan.";
      }
    } else {
      if (selectedFiles.length === 0 && !hasYoutube) {
        newErrors.images = "Pilih minimal 1 foto/video atau masukkan tautan video YouTube.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const resolvedDate = activityDate
        ? new Date(activityDate).toISOString()
        : new Date().toISOString();
      const resolvedTitle = title.trim() || "Dokumentasi kegiatan";
      const resolvedDesc = description.trim() || null;

      if (isEditing) {
        // Mode Edit Tunggal
        const finalUrl = hasYoutube ? cleanYt : singleImageUrl;
        const payload = {
          title: resolvedTitle,
          category,
          activityDate: resolvedDate,
          imageUrl: finalUrl,
          description: resolvedDesc,
        };

        const res = await safeFetch(`/api/admin/gallery/${itemToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Dokumentasi kegiatan berhasil diperbarui.");
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(data.message || "Gagal memperbarui dokumentasi kegiatan.");
        }
      } else {
        // Mode Tambah Banyak Media (Batch Upload)
        const uploadedUrls = [];
        const total = selectedFiles.length;

        for (let i = 0; i < total; i++) {
          const item = selectedFiles[i];
          const isVid = Boolean(item.isVideo);
          setUploadProgressText(
            `Mengunggah ${isVid ? "video" : "foto"} ${i + 1} dari ${total} ke penyimpanan...`
          );

          const uploadResult = await uploadFileToServer({
            file: item.file,
            context: isVid ? "GALLERY_VIDEO" : "GALLERY",
            identifier: resolvedTitle,
          });

          uploadedUrls.push(uploadResult.url);
        }

        // Sertakan video YouTube jika diisi
        if (hasYoutube && isYouTubeUrl(cleanYt)) {
          uploadedUrls.push(cleanYt);
        }

        setUploadProgressText("Menyimpan ke basis data...");

        const batchPayload = {
          items: uploadedUrls.map((url) => ({
            title: resolvedTitle,
            category,
            activityDate: resolvedDate,
            imageUrl: url,
            description: resolvedDesc,
          })),
        };

        const res = await safeFetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batchPayload),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(`${uploadedUrls.length} dokumentasi kegiatan berhasil disimpan.`);
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(data.message || "Gagal menyimpan dokumentasi kegiatan.");
        }
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kendala saat mengunggah dokumentasi.");
    } finally {
      setIsSubmitting(false);
      setUploadProgressText("");
    }
  };

  const hasValidYoutube = Boolean(youtubeUrl && isYouTubeUrl(youtubeUrl.trim()));
  const totalCount = selectedFiles.length + (hasValidYoutube ? 1 : 0);

  const submitLabel = isEditing
    ? "Perbarui dokumentasi"
    : totalCount > 0
    ? `Simpan ${totalCount} berkas`
    : "Simpan dokumentasi";

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      title={isEditing ? "Edit dokumentasi kegiatan" : "Tambah dokumentasi kegiatan"}
      submitText={submitLabel}
      submittingText={uploadProgressText || "Menyimpan..."}
      isSubmitting={isSubmitting}
    >
      <AdminGalleryMetadataFields
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        categoryList={categoryList}
        onCreateCategory={handleCreateCategory}
        activityDate={activityDate}
        setActivityDate={setActivityDate}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        isBatch={!isEditing}
      />

      {/* Zona Unggah Berkas Foto & Video Sorotan Terpadu */}
      <FileUploadZone
        multiple={!isEditing}
        value={isEditing ? singleImageUrl : ""}
        onChange={
          isEditing
            ? (url) => {
                setSingleImageUrl(url);
                if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
              }
            : undefined
        }
        files={!isEditing ? selectedFiles : []}
        onFilesChange={
          !isEditing
            ? (newFiles) => {
                setSelectedFiles(newFiles);
                if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
              }
            : undefined
        }
        allowVideo={!isEditing}
        context="GALLERY"
        identifier={title || "dokumentasi-kegiatan"}
        label={isEditing ? "Foto dokumentasi kegiatan" : "Foto dan video sorotan kegiatan"}
        required={!isEditing && !hasValidYoutube}
        helperText={
          isEditing
            ? "Mendukung JPG, PNG, WebP (Maks. 5MB). Otomatis dioptimasi dan disimpan ke R2."
            : "JPG, PNG, WebP (Maks. 5MB) • Video MP4/WebM (Maks. 1 video, 25MB, 60 dtk)"
        }
        isUploading={isSubmitting}
        uploadProgressText={uploadProgressText}
        error={errors.images}
      />

      {/* Keterangan / Deskripsi Kegiatan - Selalu Paling Bawah */}
      <FormField label="Keterangan kegiatan (opsional)">
        <Textarea
          rows={2}
          placeholder="Catatan tambahan lokasi, jumlah penerima manfaat, atau cerita singkat..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-sm leading-relaxed"
        />
      </FormField>
    </FormDialog>
  );
}
