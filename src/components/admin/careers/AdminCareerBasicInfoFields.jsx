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
import { sanitizeStandardText } from "@/lib/sanitizer";

export function AdminCareerBasicInfoFields({
  title,
  onTitleChange,
  department,
  onDepartmentChange,
  departmentList,
  onCreateDepartment,
  type,
  onTypeChange,
  employmentTypes,
  location,
  onLocationChange,
  locationList,
  onCreateLocation,
  workplace,
  onWorkplaceChange,
  experience,
  onExperienceChange,
  deadline,
  onDeadlineChange,
  isActive,
  onIsActiveChange,
  errors = {},
  onClearError,
}) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Divisi */}
        <FormField label="Divisi / departemen" required error={errors.department}>
          <CreatableCombobox
            options={departmentList}
            value={department}
            onChange={(val) => {
              onDepartmentChange(val);
              if (onClearError) onClearError("department");
            }}
            onCreate={onCreateDepartment}
            placeholder="Pilih divisi..."
            searchPlaceholder="Cari divisi atau buat baru..."
            createPrefix="Buat divisi"
            className="bg-white"
          />
        </FormField>

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

        {/* Sistem kerja */}
        <FormField label="Sistem kerja">
          <Select value={workplace} onValueChange={onWorkplaceChange}>
            <SelectTrigger className="h-10 text-sm bg-white">
              <SelectValue placeholder="Pilih sistem kerja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="On-site">On-site (Kantor/Asrama)</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

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
        <FormField label="Batas akhir pendaftaran">
          <Input
            type="text"
            placeholder="Contoh: 30 November 2026"
            value={deadline}
            maxLength={50}
            onChange={(e) => onDeadlineChange(sanitizeStandardText(e.target.value, 50))}
            onBlur={() => onDeadlineChange(deadline.trim())}
            className="h-10 text-sm bg-white"
          />
        </FormField>
      </div>

      {/* Status aktif lowongan */}
      <Checkbox
        id="isActive"
        variant="card"
        checked={isActive}
        onCheckedChange={onIsActiveChange}
        label="Buka lowongan untuk publik"
        description="Pelamar dapat melihat detail posisi dan mengirimkan formulir lamaran di halaman karier"
      />
    </>
  );
}
