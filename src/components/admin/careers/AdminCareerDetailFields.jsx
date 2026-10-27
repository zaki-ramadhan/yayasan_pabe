import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";

export function AdminCareerDetailFields({
  overview,
  onOverviewChange,
  responsibilitiesText,
  onResponsibilitiesChange,
  requirementsText,
  onRequirementsChange,
  errors = {},
  onClearError,
}) {
  return (
    <>
      {/* Ringkasan posisi */}
      <FormField label="Ringkasan & tujuan posisi" required error={errors.overview}>
        <Textarea
          rows={3}
          placeholder="Jelaskan peran penting posisi ini dalam mengemban amanah yayasan..."
          value={overview}
          onChange={(e) => {
            onOverviewChange(e.target.value);
            if (onClearError) onClearError("overview");
          }}
          required
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>

      {/* Tanggung jawab */}
      <FormField label="Tanggung jawab utama (satu butir per baris)">
        <Textarea
          rows={3}
          placeholder="Memimpin pendataan mustahik secara berkala&#10;Menyusun laporan pertanggungjawaban penyaluran&#10;Berkoordinasi dengan relawan lapangan"
          value={responsibilitiesText}
          onChange={(e) => onResponsibilitiesChange(e.target.value)}
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>

      {/* Kualifikasi & persyaratan */}
      <FormField label="Kualifikasi & persyaratan (satu butir per baris)">
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

