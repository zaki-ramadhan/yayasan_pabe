"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DEPARTMENT_OPTIONS,
  TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/data/careers";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminCareerModal({
  isOpen,
  onOpenChange,
  vacancyToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(vacancyToEdit);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Operasional & Penyaluran");
  const [location, setLocation] = useState("Jakarta Timur / Depok");
  const [type, setType] = useState("Penuh Waktu (Full-time)");
  const [workplace, setWorkplace] = useState("On-site");
  const [experience, setExperience] = useState("1 - 3 tahun");
  const [deadline, setDeadline] = useState("30 November 2026");
  const [overview, setOverview] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vacancyToEdit) {
      setTitle(vacancyToEdit.title || "");
      setDepartment(vacancyToEdit.department || "Operasional & Penyaluran");
      setLocation(vacancyToEdit.location || "Jakarta Timur / Depok");
      setType(vacancyToEdit.type || "Penuh Waktu (Full-time)");
      setWorkplace(vacancyToEdit.workplace || "On-site");
      setExperience(vacancyToEdit.experience || "1 - 3 tahun");
      setDeadline(vacancyToEdit.deadline || "30 November 2026");
      setOverview(vacancyToEdit.overview || "");
      setResponsibilitiesText((vacancyToEdit.responsibilities || []).join("\n"));
      setRequirementsText((vacancyToEdit.requirements || []).join("\n"));
      setBenefitsText((vacancyToEdit.benefits || []).join("\n"));
      setIsActive(vacancyToEdit.isActive !== undefined ? vacancyToEdit.isActive : true);
    } else {
      setTitle("");
      setDepartment("Operasional & Penyaluran");
      setLocation("Jakarta Timur / Depok");
      setType("Penuh Waktu (Full-time)");
      setWorkplace("On-site");
      setExperience("1 - 3 tahun");
      setDeadline("30 November 2026");
      setOverview("");
      setResponsibilitiesText("");
      setRequirementsText("");
      setBenefitsText("");
      setIsActive(true);
    }
  }, [vacancyToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Nama posisi pekerjaan wajib diisi.");
      return;
    }
    if (!overview.trim()) {
      toast.error("Deskripsi ringkasan posisi wajib diisi.");
      return;
    }

    const responsibilities = responsibilitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const requirements = requirementsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const benefits = benefitsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/careers/${vacancyToEdit.id}`
        : "/api/admin/careers";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          workplace,
          experience,
          deadline,
          overview,
          responsibilities,
          requirements,
          benefits,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "Lowongan berhasil diperbarui." : "Lowongan pekerjaan baru berhasil dibuat.");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal menyimpan lowongan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan lowongan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = DEPARTMENT_OPTIONS.filter((d) => d !== "Semua Divisi");
  const types = TYPE_OPTIONS.filter((t) => t !== "Semua Tipe");
  const locations = LOCATION_OPTIONS.filter((l) => l !== "Semua Lokasi");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
            {isEditing ? "Sunting Lowongan Pekerjaan" : "Buka Lowongan Pekerjaan Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Rekrut amil profesional dan staf penggerak kebaikan di lingkungan Yayasan PABE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul Posisi */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Nama Posisi / Jabatan <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Staff Monitoring & Evaluasi Mustahik"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Divisi */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Divisi / Departemen <span className="text-rose-500">*</span>
              </label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger className="h-10 text-sm bg-white">
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipe Pekerjaan */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Tipe Kepegawaian <span className="text-rose-500">*</span>
              </label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="h-10 text-sm bg-white">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {tp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lokasi Kerja */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Lokasi Penempatan <span className="text-rose-500">*</span>
              </label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger className="h-10 text-sm bg-white">
                  <SelectValue placeholder="Pilih Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sistem Kerja (Workplace) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Sistem Kerja
              </label>
              <Select value={workplace} onValueChange={setWorkplace}>
                <SelectTrigger className="h-10 text-sm bg-white">
                  <SelectValue placeholder="Pilih Sistem Kerja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On-site">On-site (Kantor/Asrama)</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Batas Pengalaman */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Pengalaman Kerja
              </label>
              <Input
                type="text"
                placeholder="Contoh: 1 - 2 tahun / Fresh graduate"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="h-10 text-sm bg-white"
              />
            </div>

            {/* Batas Akhir Lamar (Deadline) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Batas Akhir Pendaftaran
              </label>
              <Input
                type="text"
                placeholder="Contoh: 30 November 2026"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-10 text-sm bg-white"
              />
            </div>
          </div>

          {/* Status Aktif Lowongan */}
          <Checkbox
            id="isActive"
            variant="card"
            checked={isActive}
            onCheckedChange={setIsActive}
            label="Buka Lowongan untuk Publik"
            description="Pelamar dapat melihat detail posisi dan mengirimkan formulir lamaran di halaman karier"
          />

          {/* Ringkasan Posisi (Overview) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Ringkasan &amp; Tujuan Posisi <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={3}
              placeholder="Jelaskan peran penting posisi ini dalam mengemban amanah yayasan..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              required
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Tanggung Jawab (1 per baris) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Tanggung Jawab Utama (Satu butir per baris)
            </label>
            <Textarea
              rows={3}
              placeholder="Memimpin pendataan mustahik secara berkala&#10;Menyusun laporan pertanggungjawaban penyaluran&#10;Berkoordinasi dengan relawan lapangan"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Kualifikasi & Persyaratan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Kualifikasi &amp; Persyaratan (Satu butir per baris)
            </label>
            <Textarea
              rows={3}
              placeholder="Pendidikan minimal D3/S1 semua jurusan&#10;Memiliki empati sosial dan komitmen integritas tinggi&#10;Mampu mengoperasikan spreadsheet dan aplikasi pelaporan"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-medium cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Terbitkan Lowongan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
