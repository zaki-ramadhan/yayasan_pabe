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
import { DatePicker } from "@/components/ui/DatePicker";
import { useStagedUploads } from "@/hooks/useStagedUploads";

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

  const { trackUpload, commitUploads, discardUploads } = useStagedUploads();

  const handleClose = () => {
    discardUploads();
    onClose();
  };

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

    if (!postUrl.trim()) {
      toast.error("Tautan postingan Instagram wajib diisi.");
      return;
    }

    try {
      const parsedUrl = new URL(postUrl.trim());
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        toast.error("Tautan postingan harus diawali dengan http:// atau https://.");
        return;
      }
    } catch {
      toast.error("Format tautan postingan Instagram tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        imageUrl: imageUrl ? String(imageUrl).trim() : "",
        caption: caption.trim(),
        altText: altText.trim() || caption.trim().slice(0, 100),
        postUrl: postUrl.trim(),
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
        commitUploads();
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
    const hasImage = imageUrl instanceof File || (typeof imageUrl === "string" && Boolean(imageUrl.trim()));
    if (!isEditing || !postToEdit) {
      return Boolean(hasImage || caption.trim() || postUrl.trim());
    }
    if (imageUrl instanceof File) return true;
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
        imageUrl: typeof imageUrl === "string" ? imageUrl : "",
        caption,
        altText,
        postUrl,
        postedAt,
      }
    );
  }, [isEditing, postToEdit, imageUrl, caption, altText, postUrl, postedAt]);

  const isFormValid = useMemo(() => {
    const hasImage = typeof imageUrl === "string" && Boolean(imageUrl.trim());
    return Boolean(hasImage && caption.trim() && postUrl.trim());
  }, [imageUrl, caption, postUrl]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit postingan Instagram" : "Tambah postingan Instagram baru"}
      maxWidth="max-w-2xl"
      submitText="Simpan"
      submittingText="Menyimpan..."
      isSubmitting={isSubmitting}
      submitDisabled={!isFormValid || (isEditing && !isDirty)}
    >
      <div className="space-y-4 py-1">
        {/* Mendukung upload R2 langsung maupun URL eksternal CDN */}
        <FileUploadZone
          label="Foto postingan"
          value={imageUrl}
          onChange={setImageUrl}
          context="INSTAGRAM"
          onUploadSuccess={trackUpload}
          required
          helperText="Unggah foto postingan atau tempelkan tautan gambar."
        />

        <FormField label="Caption postingan" required>
          <Textarea
            value={caption}
            maxLength={2000}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => setCaption((prev) => prev.trim())}
            placeholder="Tuliskan caption postingan Instagram..."
            rows={4}
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Tanggal posting" required>
            <DatePicker
              value={postedAt}
              onChange={setPostedAt}
              placeholder="Pilih tanggal posting..."
              clearable={false}
            />
          </FormField>

          <FormField label="Tautan postingan" required>
            <Input
              type="url"
              inputMode="url"
              maxLength={300}
              spellCheck={false}
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value.replace(/\s+/g, "").slice(0, 300))}
              onBlur={() => setPostUrl((prev) => prev.trim())}
              placeholder="https://www.instagram.com/p/..."
            />
          </FormField>
        </div>
      </div>
    </FormDialog>
  );
}
