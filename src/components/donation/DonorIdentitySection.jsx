import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { sanitizeName, sanitizePhone, sanitizeEmail } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { PrayerTextarea } from "@/components/donation/PrayerTextarea";
import { CheckoutStepHeader } from "@/components/donation/CheckoutStepHeader";

export function DonorIdentitySection({
  isAnonymous,
  setIsAnonymous,
  donorName,
  setDonorName,
  donorPhone,
  setDonorPhone,
  donorEmail,
  setDonorEmail,
  isEmailLocked = false,
  errors = {},
  setErrors,
  prayer,
  setPrayer,
  onPrayerChange,
  hasExistingPrayer = false,
  isZakat = false,
}) {
  const clearError = (field) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <CheckoutStepHeader
        step={3}
        title={isZakat ? "Data muzakki & niat kebaikan" : "Data donatur & doa kebaikan"}
      />

      {/* Anonim checkbox */}
      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={(val) => {
          setIsAnonymous(val);
        }}
      />

      {/* Nama Lengkap (Selalu diisi untuk keperluan kuitansi & audit resmi) */}
      <FormField
        label={isZakat ? "Nama lengkap muzakki" : "Nama lengkap"}
        required
        error={errors.donorName}
        hint={
          isAnonymous
            ? "Nama disamarkan pada rekap publik & feed doa."
            : isZakat
            ? "Nama lengkap sesuai KTP untuk penerbitan kuitansi zakat resmi."
            : "Nama lengkap Anda untuk penerbitan kuitansi resmi yayasan."
        }
      >
        <Input
          type="text"
          required
          value={donorName}
          minLength={FIELD_LIMITS.NAME.min}
          maxLength={FIELD_LIMITS.NAME.max}
          onChange={(e) => {
            setDonorName(sanitizeName(e.target.value));
            clearError("donorName");
          }}
          onBlur={() => setDonorName((prev) => prev.trim())}
          placeholder={isZakat ? "Masukkan nama lengkap sesuai KTP" : "Nama lengkap Anda"}
          className="h-11 text-sm font-normal"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Alamat email aktif"
          required
          error={errors.donorEmail}
          hint={
            isEmailLocked
              ? isZakat
                ? "Email terkunci sesuai akun login Anda. Kuitansi zakat & invoice dikirim ke sini."
                : "Email terkunci sesuai akun login Anda. Kuitansi donasi & invoice dikirim ke sini."
              : isZakat
              ? "Kuitansi zakat resmi dan invoice akan dikirim ke email ini."
              : "Invoice dan kuitansi donasi digital resmi akan dikirim ke email ini."
          }
        >
          <div className={isEmailLocked ? "cursor-not-allowed" : ""}>
            <Input
              type="email"
              inputMode="email"
              spellCheck={false}
              required
              readOnly={isEmailLocked}
              tabIndex={isEmailLocked ? -1 : undefined}
              value={donorEmail}
              minLength={FIELD_LIMITS.EMAIL.min}
              maxLength={FIELD_LIMITS.EMAIL.max}
              onChange={(e) => {
                if (!isEmailLocked) {
                  setDonorEmail(sanitizeEmail(e.target.value));
                  clearError("donorEmail");
                }
              }}
              onBlur={() => setDonorEmail((prev) => prev.trim())}
              placeholder="email@domain.com"
              className={cn(
                "h-11 text-sm font-normal",
                isEmailLocked && "bg-slate-100 text-slate-500 border-slate-300 focus:border-slate-300 focus:ring-0 hover:border-slate-300 pointer-events-none select-none shadow-none"
              )}
            />
          </div>
        </FormField>

        <FormField
          label="Nomor telepon / kontak (opsional)"
          error={errors.donorPhone}
          hint="Opsional, untuk koordinasi & konfirmasi darurat jika diperlukan."
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={donorPhone}
            minLength={FIELD_LIMITS.PHONE.min}
            maxLength={FIELD_LIMITS.PHONE.max}
            onChange={(e) => {
              setDonorPhone(sanitizePhone(e.target.value));
              clearError("donorPhone");
            }}
            onBlur={() => setDonorPhone((prev) => prev.trim())}
            placeholder="081234567890"
            className="h-11 text-sm font-normal"
          />
        </FormField>
      </div>

      {/* Doa / Pesan Kebaikan (Maksimal 1 doa per orang) */}
      <div className="space-y-1.5 pt-1">
        {hasExistingPrayer && !prayer && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-600 font-normal">
            Anda telah menitipkan doa untuk program ini sebelumnya. Tuliskan pesan di bawah jika ingin memperbarui doa Anda.
          </div>
        )}

        <PrayerTextarea
          value={prayer}
          onChange={onPrayerChange}
          onBlur={() => setPrayer((prev) => prev.trim().replace(/\s+/g, " "))}
          showInfo
        />
      </div>
    </div>
  );
}
