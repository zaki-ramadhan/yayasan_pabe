import { CheckCircle2 } from "lucide-react";

export function VolunteerSuccessCard() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">
        Jazakumullahu Khairan Katsiran
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        Terima kasih atas niat mulia Anda untuk bergabung sebagai Relawan Yayasan PABE. Tim koordinator kami akan menghubungi nomor WhatsApp Anda saat ada aksi kemanusiaan di wilayah Anda.
      </p>
    </div>
  );
}
