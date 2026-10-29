"use client";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { sanitizeStandardText } from "@/lib/sanitizer";

/**
 * Sub-widget formulir metadata kegiatan galeri (Judul, Kategori, Tanggal, YouTube).
 * Memisahkan tanggung jawab input teks & dropdown dari modal utama.
 */
export function AdminGalleryMetadataFields({
  title,
  setTitle,
  category,
  setCategory,
  categoryList,
  onCreateCategory,
  activityDate,
  setActivityDate,
  youtubeUrl = "",
  setYoutubeUrl,
  isBatch = false,
}) {
  return (
    <div className="space-y-4">
      {/* Judul Kegiatan */}
      <FormField label={isBatch ? "Judul kegiatan bersama" : "Judul kegiatan / foto"}>
        <Input
          type="text"
          placeholder="Contoh: Penyerahan santunan adik asuh yatim"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(sanitizeStandardText(e.target.value, 120))}
          onBlur={() => setTitle((prev) => (typeof prev === "string" ? prev.trim() : prev))}
          className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
        />
        <p className="text-xs text-slate-500 mt-1">
          {isBatch
            ? "Judul ini akan diterapkan ke seluruh foto yang diunggah bersamaan."
            : "Boleh dikosongkan jika tidak ada nama khusus (default: \"Dokumentasi kegiatan\")."}
        </p>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Kategori Kegiatan */}
        <FormField label="Kategori kegiatan" required>
          <CreatableCombobox
            options={categoryList}
            value={category}
            onChange={(val) => setCategory(val)}
            onCreate={onCreateCategory}
            placeholder="Pilih kategori..."
            searchPlaceholder="Cari atau buat kategori..."
            createPrefix="Buat kategori"
            className="bg-white"
          />
        </FormField>

        {/* Tanggal Kegiatan */}
        <FormField label="Tanggal kegiatan">
          <DatePicker
            value={activityDate}
            onChange={setActivityDate}
            placeholder="Pilih tanggal..."
          />
        </FormField>
      </div>

      {/* Tautan Video YouTube Opsional */}
      {setYoutubeUrl && (
        <FormField label="Tautan video YouTube (opsional)">
          <Input
            type="url"
            inputMode="url"
            maxLength={500}
            spellCheck={false}
            placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value.replace(/\s+/g, "").slice(0, 500))}
            onBlur={() => setYoutubeUrl((prev) => (typeof prev === "string" ? prev.trim() : prev))}
            className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
          />
          <p className="text-xs text-slate-500 mt-1">
            Tempel tautan video YouTube (publik/unlisted). Sangat disarankan untuk video dokumentasi berdurasi panjang (&gt; 1 menit).
          </p>
        </FormField>
      )}
    </div>
  );
}
