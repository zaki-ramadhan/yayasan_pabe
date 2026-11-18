import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { sanitizeName, sanitizeEmail } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { cn } from "@/lib/utils";

export function RoutineDonorIdentity({
  fullName,
  setFullName,
  email = "",
  setEmail,
  isAnonymous,
  setIsAnonymous,
  errors = {},
  setErrors,
  isLoggedIn = false,
  currentUser = null,
}) {
  const clearError = (field) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const displayEmail = isLoggedIn ? (currentUser?.email || email) : "";

  return (
    <div id="tour-donor-identity" className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <h2 className="text-base sm:text-lg font-semibold text-slate-950">
        Data donatur
      </h2>

      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={(val) => {
          setIsAnonymous(val);
          if (val) clearError("fullName");
        }}
      />

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

      <FormField
        label="Alamat email aktif"
        required
        error={errors.email}
        hint={
          !isLoggedIn
            ? "Masuk ke akun Anda untuk mengunci email donatur resmi secara otomatis."
            : undefined
        }
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          isLocked={isLoggedIn}
          lockedNotice="Email terisi otomatis dari akun Anda. Silakan sesuaikan lewat profil."
          disabled={!isLoggedIn}
          spellCheck={false}
          value={displayEmail}
          placeholder={isLoggedIn ? "nama@email.com" : "Otomatis terisi setelah masuk ke akun"}
          className="h-11 text-sm font-normal"
        />
      </FormField>
    </div>
  );
}
