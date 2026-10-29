"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { isFormDirty } from "@/lib/formUtils";
import { sanitizeStandardText } from "@/lib/sanitizer";

export function AdminInstagramPostModal({
  isOpen,
  onClose,
  postToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(postToEdit);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postedAt, setPostedAt] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setImageUrl(postToEdit.imageUrl || "");
        setCaption(postToEdit.caption || "");
        setAltText(postToEdit.altText || "");
        setPostUrl(postToEdit.postUrl || "");
        setPostedAt(
          postToEdit.postedAt
            ? new Date(postToEdit.postedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
      } else {
        setImageUrl("");
        setCaption("");
        setAltText("");
        setPostUrl("");
        setPostedAt(new Date().toISOString().split("T")[0]);
      }
    }
  }, [isOpen, postToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      toast.error("Foto / media postingan Instagram wajib diunggah.");
      return;
    }

    if (!caption.trim()) {
      toast.error("Caption postingan Instagram wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
        altText: altText.trim() || caption.trim().slice(0, 100),
        postUrl: postUrl.trim() || "https://www.instagram.com",
        postedAt: postedAt ? new Date(postedAt).toISOString() : new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
      };

      const url = isEditing
        ? `/api/admin/instagram/posts/${postToEdit.id}`
        : "/api/admin/instagram/posts";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(
          isEditing
            ? "Postingan Instagram berhasil diperbarui."
            : "Postingan Instagram berhasil ditambahkan."
        );
        if (onSuccess) onSuccess();
      } else {
        toast.error(json.message || "Gagal menyimpan postingan Instagram.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = useMemo(() => {
    if (!isEditing || !postToEdit) {
      return Boolean(imageUrl.trim() || caption.trim() || postUrl.trim());
    }
    const initialPostedAt = postToEdit.postedAt
      ? new Date(postToEdit.postedAt).toISOString().split("T")[0]
      : "";
    return isFormDirty(
      {
        imageUrl: postToEdit.imageUrl || "",
        caption: postToEdit.caption || "",
        altText: postToEdit.altText || "",
        postUrl: postToEdit.postUrl || "",
        postedAt: initialPostedAt,
      },
      {
        imageUrl,
        caption,
        altText,
        postUrl,
        postedAt,
      }
    );
  }, [isEditing, postToEdit, imageUrl, caption, altText, postUrl, postedAt]);

  const isFormValid = useMemo(() => {
    return Boolean(imageUrl.trim() && caption.trim());
  }, [imageUrl, caption]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit postingan dokumentasi" : "Tambah dokumentasi Instagram baru"}
      maxWidth="max-w-xl"
      submitText="Simpan"
      isSubmitting={isSubmitting}
      submitDisabled={!isFormValid || (isEditing && !isDirty)}
    >
      <div className="space-y-4 py-1">
        {/* Mendukung upload R2 langsung maupun URL eksternal CDN */}
        <FileUploadZone
          label="Foto / media dokumentasi"
          value={imageUrl}
          onChange={setImageUrl}
          context="INSTAGRAM"
          required
          helperText="Unggah berkas foto ke Cloudflare R2 atau tempelkan URL gambar eksternal/CDN."
        />

        <FormField label="Caption / narasi kegiatan" required>
          <Textarea
            value={caption}
            maxLength={2000}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => setCaption((prev) => prev.trim())}
            placeholder="Tuliskan keterangan kegiatan, penyaluran, atau pesan amanah donatur..."
            rows={4}
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Tanggal kegiatan / posting" required>
            <Input
              type="date"
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Teks alt (aksesibilitas foto)">
            <Input
              type="text"
              maxLength={150}
              value={altText}
              onChange={(e) => setAltText(sanitizeStandardText(e.target.value, 150))}
              onBlur={() => setAltText((prev) => prev.trim())}
              placeholder="Deskripsi singkat foto..."
            />
          </FormField>
        </div>

        <FormField label="Tautan postingan di Instagram (opsional)">
          <Input
            type="url"
            inputMode="url"
            maxLength={300}
            spellCheck={false}
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value.replace(/\s+/g, "").slice(0, 300))}
            onBlur={() => setPostUrl((prev) => prev.trim())}
            placeholder="https://www.instagram.com/p/..."
          />
        </FormField>
      </div>
    </FormDialog>
  );
}
