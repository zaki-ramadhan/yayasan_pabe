"use client";

import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { WORKPLACE_OPTIONS } from "@/data/careers";

export function AdminCareerBasicInfoFields({
  title,
  onTitleChange,
  type,
  onTypeChange,
  employmentTypes,
  contractDuration = "",
  onContractDurationChange,
  durationList = [],
  onCreateDuration,
  workplace = "Kerja di lokasi",
  onWorkplaceChange,
  location,
  onLocationChange,
  locationList,
  onCreateLocation,
  experience,
  onExperienceChange,
  deadline,
  onDeadlineChange,
  isActive,
  onIsActiveChange,
  requiresResume = true,
  onRequiresResumeChange,
  errors = {},
  onClearError,
}) {
  const isContract = type === "Kontrak / Project";

  return (
    <>
      {/* Judul posisi */}
      <FormField label="Nama posisi / jabatan" required error={errors.title}>
        <Input
          type="text"
          placeholder="Contoh: Staff Monitoring & Evaluasi Mustahik"
          value={title}
          maxLength={100}
          onChange={(e) => {
            onTitleChange(sanitizeStandardText(e.target.value, 100));
            if (onClearError) onClearError("title");
          }}
          onBlur={() => onTitleChange(title.trim())}
          required
          className="h-10 text-sm bg-white"
        />
      </FormField>

      {/* Baris 1: Tipe kepegawaian & Durasi kontrak (kondisional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Tipe pekerjaan */}
        <FormField label="Tipe kepegawaian" required>
          <Select value={type} onValueChange={onTypeChange} required>
            <SelectTrigger className="h-10 text-sm bg-white">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Durasi kontrak / proyek saat Kontrak / Project dipilih */}
        {isContract && (
          <FormField
            label="Durasi kontrak / proyek"
            required
            error={errors.contractDuration}
            hint="Pilih opsi umum atau ketik untuk membuat baru."
          >
            <CreatableCombobox
              options={durationList}
              value={contractDuration}
              onChange={(val) => {
                if (onContractDurationChange) onContractDurationChange(val);
                if (onClearError) onClearError("contractDuration");
              }}
              onCreate={onCreateDuration}
              placeholder="Pilih durasi kontrak..."
              searchPlaceholder="Cari durasi atau buat baru..."
              createPrefix="Gunakan durasi"
              className="bg-white"
            />
          </FormField>
        )}
      </div>

      {/* Baris 2: Sistem kerja & Lokasi penempatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Sistem kerja */}
        <FormField label="Sistem kerja">
          <Select value={workplace} onValueChange={onWorkplaceChange}>
            <SelectTrigger className="h-10 text-sm bg-white">
              <SelectValue placeholder="Pilih sistem kerja" />
            </SelectTrigger>
            <SelectContent>
              {WORKPLACE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Lokasi kerja */}
        <FormField label="Lokasi penempatan" required error={errors.location}>
          <CreatableCombobox
            options={locationList}
            value={location}
            onChange={(val) => {
              onLocationChange(val);
              if (onClearError) onClearError("location");
            }}
            onCreate={onCreateLocation}
            placeholder="Pilih lokasi..."
            searchPlaceholder="Cari lokasi atau buat baru..."
            createPrefix="Buat lokasi"
            className="bg-white"
          />
        </FormField>
      </div>

      {/* Baris 3: Pengalaman kerja & Batas akhir pendaftaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Batas pengalaman */}
        <FormField label="Pengalaman kerja">
          <Input
            type="text"
            placeholder="Contoh: 1 - 2 tahun / Fresh graduate"
            value={experience}
            maxLength={50}
            onChange={(e) => onExperienceChange(sanitizeStandardText(e.target.value, 50))}
            onBlur={() => onExperienceChange(experience.trim())}
            className="h-10 text-sm bg-white"
          />
        </FormField>

        {/* Batas akhir lamar */}
        <FormField label="Batas akhir pendaftaran" error={errors.deadline}>
          <DatePicker
            value={deadline}
            onChange={(val) => {
              onDeadlineChange(val || "");
              if (onClearError) onClearError("deadline");
            }}
            placeholder="Pilih batas akhir pendaftaran..."
          />
        </FormField>
      </div>

      <div className="space-y-3 pt-1">
        {/* Wajibkan lampiran berkas CV */}
        <Checkbox
          id="requiresResume"
          variant="card"
          checked={requiresResume}
          onCheckedChange={onRequiresResumeChange}
          label="Wajibkan lampiran berkas CV / resume (PDF)"
          description="Jika dicentang, pelamar wajib mengunggah dokumen PDF. Jika tidak dicentang, pelamar cukup mengisi data diri dan motivasi."
        />

        {/* Status aktif lowongan */}
        <Checkbox
          id="isActive"
          variant="card"
          checked={isActive}
          onCheckedChange={onIsActiveChange}
          label="Buka lowongan untuk publik"
          description="Pelamar dapat melihat detail posisi dan mengirimkan formulir lamaran di halaman karier"
        />
      </div>
    </>
  );
}
