import { Lock } from "lucide-react";
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

      {/* Email Utama - Terkunci Otomatis Sesuai Akun Login */}
      <FormField
        label="Alamat email aktif"
        required
        error={errors.email}
        hint={
          isLoggedIn
            ? "Terkunci sesuai akun Anda. Tautan invoice & kuitansi resmi otomatis dikirim ke email ini."
            : "Masuk ke akun Anda untuk mengunci email donatur resmi secara otomatis."
        }
      >
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            readOnly={isLoggedIn}
            disabled={!isLoggedIn}
            spellCheck={false}
            value={displayEmail}
            placeholder={isLoggedIn ? "nama@email.com" : "Otomatis terisi setelah masuk ke akun"}
            className={cn(
              "h-11 text-sm font-normal pl-9 select-none",
              isLoggedIn
                ? "bg-slate-100 text-slate-800 border-slate-300 cursor-not-allowed"
                : "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
            )}
          />
        </div>
      </FormField>
    </div>
  );
}
