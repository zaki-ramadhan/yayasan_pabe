import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { sanitizeName, sanitizePhone, sanitizeEmail } from "@/lib/security";
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
}) {
  const clearError = (field) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <CheckoutStepHeader step={3} title="Data Donatur & Doa Kebaikan" />

      {/* Anonim checkbox */}
      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={(val) => {
          setIsAnonymous(val);
          if (val) clearError("donorName");
        }}
      />

      {!isAnonymous && (
        <FormField
          label="Nama lengkap"
          required
          error={errors.donorName}
        >
          <Input
            type="text"
            required={!isAnonymous}
            value={donorName}
            maxLength={60}
            onChange={(e) => {
              setDonorName(sanitizeName(e.target.value));
              clearError("donorName");
            }}
            onBlur={() => setDonorName((prev) => prev.trim())}
            placeholder="Nama lengkap Anda"
            className="h-11 text-sm sm:text-base font-normal"
          />
        </FormField>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nomor WhatsApp"
          required
          error={errors.donorPhone}
          hint="Untuk pengiriman invoice & bukti donasi"
        >
          <Input
            type="tel"
            inputMode="tel"
            required
            value={donorPhone}
            maxLength={15}
            onChange={(e) => {
              setDonorPhone(sanitizePhone(e.target.value));
              clearError("donorPhone");
            }}
            onBlur={() => setDonorPhone((prev) => prev.trim())}
            placeholder="08xxxxxxxxxx"
            className="h-11 text-sm sm:text-base font-normal"
          />
        </FormField>

        <FormField
          label="Email"
          required
          error={errors.donorEmail}
          hint={
            isEmailLocked
              ? "Email terkunci sesuai akun login Anda untuk integrasi riwayat donasi."
              : undefined
          }
        >
          <Input
            type="email"
            inputMode="email"
            spellCheck={false}
            required
            readOnly={isEmailLocked}
            value={donorEmail}
            maxLength={100}
            onChange={(e) => {
              if (!isEmailLocked) {
                setDonorEmail(sanitizeEmail(e.target.value));
                clearError("donorEmail");
              }
            }}
            onBlur={() => setDonorEmail((prev) => prev.trim())}
            placeholder="email@domain.com"
            className={cn(
              "h-11 text-sm sm:text-base font-normal",
              isEmailLocked && "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
            )}
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
