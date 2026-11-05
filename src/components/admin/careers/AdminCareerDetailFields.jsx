import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { FormField } from "@/components/ui/FormField";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

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
      <FormField label="Ringkasan & tujuan posisi" required error={errors.overview}>
        <AutoResizeTextarea
          minRows={3}
          maxRows={8}
          minLength={FIELD_LIMITS.CAREER_SUMMARY.min}
          maxLength={FIELD_LIMITS.CAREER_SUMMARY.max}
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

      <FormField label="Tanggung jawab utama (satu butir per baris)">
        <AutoResizeTextarea
          minRows={3}
          maxRows={10}
          minLength={FIELD_LIMITS.CAREER_RESPONSIBILITY.min}
          maxLength={FIELD_LIMITS.CAREER_RESPONSIBILITY.max}
          placeholder="Memimpin pendataan mustahik secara berkala&#10;Menyusun laporan pertanggungjawaban penyaluran&#10;Berkoordinasi dengan relawan lapangan"
          value={responsibilitiesText}
          onChange={(e) => onResponsibilitiesChange(e.target.value)}
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>

      <FormField label="Kualifikasi & persyaratan (satu butir per baris)">
        <AutoResizeTextarea
          minRows={3}
          maxRows={10}
          minLength={FIELD_LIMITS.CAREER_REQUIREMENT.min}
          maxLength={FIELD_LIMITS.CAREER_REQUIREMENT.max}
          placeholder="Pendidikan minimal D3/S1 semua jurusan&#10;Memiliki empati sosial dan komitmen integritas tinggi&#10;Mampu mengoperasikan spreadsheet dan aplikasi pelaporan"
          value={requirementsText}
          onChange={(e) => onRequirementsChange(e.target.value)}
          className="w-full text-sm leading-relaxed bg-white"
        />
      </FormField>
    </>
  );
}

