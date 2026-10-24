"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

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
}) {
  return (
    <>
      {/* Judul Posisi */}
      <FormField label="Nama Posisi / Jabatan" required>
        <Input
          type="text"
          placeholder="Contoh: Staff Monitoring & Evaluasi Mustahik"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className="h-10 text-sm bg-white"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Divisi */}
        <FormField label="Divisi / Departemen" required>
          <CreatableCombobox
            options={departmentList}
            value={department}
            onChange={onDepartmentChange}
            onCreate={onCreateDepartment}
            placeholder="Pilih divisi..."
            searchPlaceholder="Cari divisi atau buat baru..."
            createPrefix="Buat divisi"
            className="bg-white"
          />
        </FormField>

        {/* Tipe Pekerjaan */}
        <FormField label="Tipe Kepegawaian" required>
          <Select value={type} onValueChange={onTypeChange} required>
            <SelectTrigger className="h-10 text-sm bg-white">
              <SelectValue placeholder="Pilih Tipe" />
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

        {/* Lokasi Kerja */}
        <FormField label="Lokasi Penempatan" required>
          <CreatableCombobox
            options={locationList}
            value={location}
            onChange={onLocationChange}
            onCreate={onCreateLocation}
            placeholder="Pilih lokasi..."
            searchPlaceholder="Cari lokasi atau buat baru..."
            createPrefix="Buat lokasi"
            className="bg-white"
          />
        </FormField>

        {/* Sistem Kerja (Workplace) */}
        <FormField label="Sistem Kerja">
          <Select value={workplace} onValueChange={onWorkplaceChange}>
            <SelectTrigger className="h-10 text-sm bg-white">
              <SelectValue placeholder="Pilih Sistem Kerja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="On-site">On-site (Kantor/Asrama)</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Batas Pengalaman */}
        <FormField label="Pengalaman Kerja">
          <Input
            type="text"
            placeholder="Contoh: 1 - 2 tahun / Fresh graduate"
            value={experience}
            onChange={(e) => onExperienceChange(e.target.value)}
            className="h-10 text-sm bg-white"
          />
        </FormField>

        {/* Batas Akhir Lamar (Deadline) */}
        <FormField label="Batas Akhir Pendaftaran">
          <Input
            type="text"
            placeholder="Contoh: 30 November 2026"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="h-10 text-sm bg-white"
          />
        </FormField>
      </div>

      {/* Status Aktif Lowongan */}
      <Checkbox
        id="isActive"
        variant="card"
        checked={isActive}
        onCheckedChange={onIsActiveChange}
        label="Buka Lowongan untuk Publik"
        description="Pelamar dapat melihat detail posisi dan mengirimkan formulir lamaran di halaman karier"
      />
    </>
  );
}
