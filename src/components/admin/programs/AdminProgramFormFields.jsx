"use client";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { AdminProgramCategorySelect } from "./AdminProgramCategorySelect";

export function AdminProgramFormFields({
  isZisMode,
  title,
  setTitle,
  categoryId,
  setCategoryId,
  categoryList,
  onCreateCategory,
  targetAmount,
  setTargetAmount,
  endDate,
  setEndDate,
  location,
  setLocation,
  bannerUrl,
  setBannerUrl,
  story,
  setStory,
  errors,
  clearError,
  onUploadSuccess,
}) {
  return (
    <>
      <FormField label="Judul program" required error={errors.title}>
        <Input
          type="text"
          placeholder={
            isZisMode
              ? "Contoh: Sedekah Subuh Berkah atau Zakat Maal"
              : "Contoh: Beasiswa Pendidikan Anak Yatim Piatu"
          }
          value={title}
          minLength={FIELD_LIMITS.PROGRAM_TITLE.min}
          maxLength={FIELD_LIMITS.PROGRAM_TITLE.max}
          onChange={(e) => {
            setTitle(
              sanitizeStandardText(e.target.value, FIELD_LIMITS.PROGRAM_TITLE.max)
            );
            if (errors.title) clearError("title");
          }}
          onBlur={() => setTitle((prev) => prev.trim())}
          className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminProgramCategorySelect
          isZisMode={isZisMode}
          categoryId={categoryId}
          categoryList={categoryList}
          error={errors.categoryId}
          onChange={(val) => {
            setCategoryId(val);
            if (errors.categoryId) clearError("categoryId");
          }}
          onCreateCategory={onCreateCategory}
        />

        <FormField label="Target pendanaan (Rp)" error={errors.targetAmount}>
          <CurrencyInput
            placeholder="0"
            value={targetAmount}
            onChange={(val) => {
              setTargetAmount(val);
              if (errors.targetAmount) clearError("targetAmount");
            }}
            className="h-10"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField label="Batas waktu penggalangan">
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Pilih batas waktu..."
          />
        </FormField>

        <FormField label="Wilayah atau lokasi penyaluran">
          <Input
            type="text"
            placeholder="Contoh: Jawa Barat & Banten"
            value={location}
            minLength={FIELD_LIMITS.PROGRAM_LOCATION.min}
            maxLength={FIELD_LIMITS.PROGRAM_LOCATION.max}
            onChange={(e) =>
              setLocation(
                sanitizeStandardText(e.target.value, FIELD_LIMITS.PROGRAM_LOCATION.max)
              )
            }
            onBlur={() => setLocation((prev) => prev.trim())}
            className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
          />
        </FormField>
      </div>

      <FileUploadZone
        value={bannerUrl}
        onChange={setBannerUrl}
        context="CAMPAIGN_BANNER"
        identifier={title}
        onUploadSuccess={onUploadSuccess}
        label="Foto sampul / banner program"
        helperText="Mendukung JPG, PNG, WebP (Maks. 10MB), bisa Ctrl + V. Otomatis dikonversi ke WebP."
      />

      <FormField label="Detail & cerita program" error={errors.story}>
        <AutoResizeTextarea
          minRows={5}
          maxRows={15}
          minLength={FIELD_LIMITS.PROGRAM_DESCRIPTION.min}
          maxLength={FIELD_LIMITS.PROGRAM_DESCRIPTION.max}
          placeholder="Tuliskan latar belakang program, sasaran penerima manfaat, dan rincian rencana penyaluran donasi yayasan..."
          value={story}
          onChange={(e) => {
            setStory(e.target.value);
            if (errors.story) clearError("story");
          }}
          onBlur={() => setStory((prev) => prev.trim())}
          className="w-full text-sm leading-relaxed"
        />
      </FormField>
    </>
  );
}

