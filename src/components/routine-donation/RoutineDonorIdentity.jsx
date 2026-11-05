import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { sanitizeName, sanitizeEmail } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

export function RoutineDonorIdentity({
  fullName,
  setFullName,
  email = "",
  setEmail,
  isAnonymous,
  setIsAnonymous,
  errors = {},
  setErrors,
}) {
  const clearError = (field) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div id="tour-donor-identity" className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      {/* Header Step 1 */}
      <h2 className="text-base sm:text-lg font-semibold text-slate-950">
        Data donatur
      </h2>

      {/* Anonymous Checkbox */}
      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={(val) => {
          setIsAnonymous(val);
          if (val) clearError("fullName");
        }}
      />

      {/* Full Name */}
      {!isAnonymous && (
        <FormField
          label="Nama lengkap"
          required
          error={errors.fullName}
        >
          <Input
            type="text"
            required={!isAnonymous}
            value={fullName}
            minLength={FIELD_LIMITS.NAME.min}
            maxLength={FIELD_LIMITS.NAME.max}
            onChange={(e) => {
              setFullName(sanitizeName(e.target.value));
              clearError("fullName");
            }}
            onBlur={() => setFullName((prev) => prev.trim())}
            placeholder="Contoh: Ahmad Fauzi"
            className="h-11 text-sm font-normal"
          />
        </FormField>
      )}

      {/* Email Utama */}
      {setEmail && (
        <FormField
          label="Alamat email aktif"
          required
          error={errors.email}
          hint="Tautan invoice QRIS & kuitansi resmi dikirim ke email ini"
        >
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            spellCheck={false}
            value={email}
            minLength={FIELD_LIMITS.EMAIL.min}
            maxLength={FIELD_LIMITS.EMAIL.max}
            onChange={(e) => {
              setEmail(sanitizeEmail(e.target.value));
              clearError("email");
            }}
            onBlur={() => setEmail((prev) => prev.trim())}
            placeholder="nama@email.com"
            className="h-11 text-sm font-normal"
          />
        </FormField>
      )}
    </div>
  );
}
