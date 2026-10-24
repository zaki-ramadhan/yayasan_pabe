import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";

export function AdminCareerDetailFields({
  overview,
  onOverviewChange,
  responsibilitiesText,
  onResponsibilitiesChange,
  requirementsText,
  onRequirementsChange,
}) {
  return (
    <>
      {/* Ringkasan Posisi (Overview) */}
      <FormField label="Ringkasan & Tujuan Posisi" required>
        <Textarea
          rows={3}
          placeholder="Jelaskan peran penting posisi ini dalam mengemban amanah yayasan..."
          value={overview}
          onChange={(e) => onOverviewChange(e.target.value)}
          required
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>

      {/* Tanggung Jawab (1 per baris) */}
      <FormField label="Tanggung Jawab Utama (Satu butir per baris)">
        <Textarea
          rows={3}
          placeholder="Memimpin pendataan mustahik secara berkala&#10;Menyusun laporan pertanggungjawaban penyaluran&#10;Berkoordinasi dengan relawan lapangan"
          value={responsibilitiesText}
          onChange={(e) => onResponsibilitiesChange(e.target.value)}
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>

      {/* Kualifikasi & Persyaratan */}
      <FormField label="Kualifikasi & Persyaratan (Satu butir per baris)">
        <Textarea
          rows={3}
          placeholder="Pendidikan minimal D3/S1 semua jurusan&#10;Memiliki empati sosial dan komitmen integritas tinggi&#10;Mampu mengoperasikan spreadsheet dan aplikasi pelaporan"
          value={requirementsText}
          onChange={(e) => onRequirementsChange(e.target.value)}
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>
    </>
  );
}

