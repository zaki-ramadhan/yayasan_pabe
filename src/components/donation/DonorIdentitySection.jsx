import { Input } from "@/components/ui/input";
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
  prayer,
  setPrayer,
  onPrayerChange,
  hasExistingPrayer = false,
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <CheckoutStepHeader step={3} title="Data Donatur & Doa Kebaikan" />

      {/* Anonim checkbox */}
      <AnonymousCheckbox
        checked={isAnonymous}
        onChange={setIsAnonymous}
      />

      {!isAnonymous && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Nama Lengkap <span className="text-rose-500">*</span></label>
          <Input
            type="text"
            required={!isAnonymous}
            value={donorName}
            maxLength={60}
            onChange={(e) => setDonorName(sanitizeName(e.target.value))}
            placeholder="Nama lengkap Anda"
            className="h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Nomor WhatsApp <span className="text-rose-500">*</span></label>
          <Input
            type="tel"
            inputMode="tel"
            required
            value={donorPhone}
            maxLength={15}
            onChange={(e) => setDonorPhone(sanitizePhone(e.target.value))}
            placeholder="08xxxxxxxxxx"
            className="h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal"
          />
          <span className="text-sm text-slate-600 block font-normal">Untuk pengiriman invoice &amp; bukti donasi</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">
            Email <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            required
            readOnly={isEmailLocked}
            value={donorEmail}
            maxLength={100}
            onChange={(e) => {
              if (!isEmailLocked) {
                setDonorEmail(sanitizeEmail(e.target.value));
              }
            }}
            placeholder="email@domain.com"
            className={cn(
              "h-11 text-sm sm:text-base border-slate-300 focus:ring-primary font-normal",
              isEmailLocked && "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
            )}
          />
          {isEmailLocked && (
            <span className="text-xs text-slate-600 block font-normal">
              Email terkunci sesuai akun login Anda untuk integrasi riwayat donasi.
            </span>
          )}
        </div>
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
