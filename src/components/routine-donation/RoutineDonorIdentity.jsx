import { Input } from "@/components/ui/input";
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
}) {
  return (
    <div id="tour-donor-identity" className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      {/* Header Step 1 (Unified with Checkout) */}
      <h2 className="text-base sm:text-lg font-semibold text-slate-950">
        Data Donatur
      </h2>

      {/* Anonymous Checkbox (Unified with Checkout) */}
      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={setIsAnonymous}
      />

      {/* Full Name */}
      {!isAnonymous && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required={!isAnonymous}
            value={fullName}
            maxLength={60}
            onChange={(e) => setFullName(sanitizeName(e.target.value))}
            placeholder="Contoh: Ahmad Fauzi"
            className="h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal"
          />
        </div>
      )}

      {/* WhatsApp and Optional Email */}
      <div className={cn("grid grid-cols-1 gap-4", setEmail ? "sm:grid-cols-2" : "")}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">
            Nomor WhatsApp <span className="text-rose-500">*</span>
          </label>
          <Input
            type="tel"
            inputMode="tel"
            required
            value={whatsapp}
            maxLength={15}
            onChange={(e) => setWhatsapp(sanitizePhone(e.target.value))}
            placeholder="0812xxxxxxxx"
            className="h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal"
          />
          <span className="text-sm text-slate-600 block font-normal">
            Pengingat berkala &amp; invoice resmi akan dikirimkan ke nomor ini
          </span>
        </div>

        {setEmail && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800 block">
              Email (Opsional)
            </label>
            <Input
              type="email"
              value={email}
              maxLength={100}
              onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
              placeholder="email@anda.com"
              className="h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal"
            />
          </div>
        )}
      </div>
    </div>
  );
}
