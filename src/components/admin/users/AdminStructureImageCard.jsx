"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { toast } from "@/hooks/useToast";

/**
 * Komponen form & pratinjau unggah bagan struktur organisasi yayasan.
 * Diletakkan di atas tabel pengurus pada halaman admin kelola pengurus.
 * Tampilan minimalis tanpa heading berlebih, terpusat, dan tombol teks di sisi kanan.
 *
 * @param {object} props
 * @param {string|null} [props.initialImage] - URL gambar bagan saat ini dari database
 */
export function AdminStructureImageCard({ initialImage = null }) {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [stagedImage, setStagedImage] = useState(initialImage || "");
  const [isEditing, setIsEditing] = useState(!initialImage);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Menyimpan URL baru ke database via API
  const handleSave = async (urlToSave) => {
    const finalUrl = urlToSave || stagedImage;
    if (!finalUrl) {
      toast.error("Pilih atau unggah file gambar terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/organization/structure-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structureImage: finalUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menyimpan bagan struktur organisasi."
        );
      }

      setCurrentImage(finalUrl);
      setIsEditing(false);
      toast.success(data.message || "Bagan struktur organisasi berhasil disimpan.");
    } catch (err) {
      toast.error(
        err.message ||
          "Terjadi kendala saat menyimpan. Periksa koneksi internet Anda dan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Menghapus gambar kustom (kembali ke default)
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/organization/structure-image", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus bagan struktur organisasi."
        );
      }

      setCurrentImage(null);
      setStagedImage("");
      setIsEditing(true);
      setShowConfirmDelete(false);
      toast.success(
        data.message || "Bagan struktur organisasi dikembalikan ke bawaan sistem."
      );
    } catch (err) {
      toast.error(err.message || "Gagal menghapus bagan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-4 sm:p-6">
      {!isEditing && currentImage ? (
        /* Mode Pratinjau Gambar Aktif */
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[220px] sm:min-h-[300px]">
            <Image
              src={currentImage}
              alt="Bagan Struktur Organisasi Yayasan"
              width={1200}
              height={800}
              className="w-full h-auto max-h-[420px] object-contain rounded-lg"
              unoptimized={
                typeof currentImage === "string" &&
                !currentImage.startsWith("/") &&
                !currentImage.includes("lh3.googleusercontent.com")
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <a
              href={currentImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Buka gambar penuh di tab baru
            </a>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStagedImage(currentImage);
                  setIsEditing(true);
                }}
                className="text-xs h-8 px-3"
              >
                Ganti Bagan
              </Button>

              {!showConfirmDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8 px-2.5"
                >
                  Hapus
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200 animate-in fade-in duration-150">
                  <span className="text-xs text-rose-700 font-medium px-1">
                    Kembalikan ke default?
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="text-xs h-7 px-2.5"
                  >
                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setShowConfirmDelete(false)}
                    className="text-xs h-7 px-2 text-slate-600"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode Upload & Form Edit */
        <div className="space-y-4 max-w-2xl mx-auto">
          <FileUploadZone
            value={stagedImage}
            onChange={(newUrl) => setStagedImage(newUrl)}
            context="ORGANIZATION_STRUCTURE"
            label=""
            helperText="Format gambar yang didukung: JPG, PNG, atau WebP (Maksimal 10 MB)."
            accept="image/jpeg,image/png,image/webp"
            showManualUrl={false}
            onUploadSuccess={(res) => {
              if (res?.url) {
                setStagedImage(res.url);
                handleSave(res.url);
              }
            }}
          />

          <div className="flex items-center justify-end gap-2.5 pt-1">
            {currentImage && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  setStagedImage(currentImage);
                  setIsEditing(false);
                }}
                className="text-xs sm:text-sm h-9 px-4 cursor-pointer"
              >
                Batal
              </Button>
            )}

            <Button
              type="button"
              disabled={isSaving || !stagedImage || stagedImage === currentImage}
              onClick={() => handleSave(stagedImage)}
              className="text-xs sm:text-sm font-medium h-9 px-5 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Bagan Organisasi"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
