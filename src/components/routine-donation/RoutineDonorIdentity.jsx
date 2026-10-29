import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { cn } from "@/lib/utils";
import { sanitizeName, sanitizePhone, sanitizeEmail } from "@/lib/security";

export function RoutineDonorIdentity({
  fullName,
  setFullName,
  whatsapp,
  setWhatsapp,
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
      {/* Header Step 1 (Unified with Checkout) */}
      <h2 className="text-base sm:text-lg font-semibold text-slate-950">
        Data Donatur
      </h2>

      {/* Anonymous Checkbox (Unified with Checkout) */}
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
            maxLength={60}
            onChange={(e) => {
              setFullName(sanitizeName(e.target.value));
              clearError("fullName");
            }}
            onBlur={() => setFullName((prev) => prev.trim())}
            placeholder="Contoh: Ahmad Fauzi"
            className="h-11 text-sm sm:text-base font-normal"
          />
        </FormField>
      )}

      {/* WhatsApp and Optional Email */}
      <div className={cn("grid grid-cols-1 gap-4", setEmail ? "sm:grid-cols-2" : "")}>
        <FormField
          label="Nomor WhatsApp"
          required
          error={errors.whatsapp}
          hint="Pengingat berkala & invoice resmi akan dikirimkan ke nomor ini"
        >
          <Input
            type="tel"
            inputMode="tel"
            required
            value={whatsapp}
            maxLength={15}
            onChange={(e) => {
              setWhatsapp(sanitizePhone(e.target.value));
              clearError("whatsapp");
            }}
            onBlur={() => setWhatsapp((prev) => prev.trim())}
            placeholder="0812xxxxxxxx"
            className="h-11 text-sm sm:text-base font-normal"
          />
        </FormField>

        {setEmail && (
          <FormField
            label="Email (opsional)"
            error={errors.email}
          >
            <Input
              type="email"
              inputMode="email"
              spellCheck={false}
              value={email}
              maxLength={100}
              onChange={(e) => {
                setEmail(sanitizeEmail(e.target.value));
                clearError("email");
              }}
              onBlur={() => setEmail((prev) => prev.trim())}
              placeholder="email@anda.com"
              className="h-11 text-sm sm:text-base font-normal"
            />
          </FormField>
        )}
      </div>
    </div>
  );
}
