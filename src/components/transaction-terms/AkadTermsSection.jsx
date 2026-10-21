import { ShieldCheck, Scale, FileCheck, RefreshCw } from "lucide-react";

const AKAD_RULES = [
  {
    icon: Scale,
    title: "Akad Wakalah Syariah",
    description:
      "Donatur memberikan mandat dan kuasa penuh (wakalah) kepada Yayasan untuk menghimpun, mengelola, serta menyalurkan dana amanah kepada mustahik yang berhak sesuai syariat Islam.",
  },
  {
    icon: ShieldCheck,
    title: "Alokasi Zakat & Infak",
    description:
      "Dana zakat disalurkan secara khusus kepada 8 asnaf penerima zakat. Sedangkan dana infak dan sedekah difokuskan pada program pendidikan anak yatim, pemberdayaan ekonomi dhuafa, dan kemanusiaan.",
  },
  {
    icon: FileCheck,
    title: "Bukti Transaksi & e-Kwitansi",
    description:
      "Setiap donasi yang berhasil diproses secara otomatis menerbitkan e-Kwitansi sah yang dapat diunduh pada riwayat donasi akun donatur sebagai bukti akuntabilitas resmi.",
  },
  {
    icon: RefreshCw,
    title: "Ketentuan Transaksi Berhasil",
    description:
      "Donasi yang telah berhasil dibayarkan bersifat tuntas dan langsung dialokasikan ke kas program amanah, sehingga tidak dapat dibatalkan atau ditarik kembali (non-refundable).",
  },
];

/**
 * AkadTermsSection: Menampilkan prinsip akad syariah dan ketentuan donasi
 * Menggunakan kartu modular dengan hierarki tipografi bersih.
 */
export function AkadTermsSection() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
        <h2 className="text-base sm:text-lg font-semibold text-slate-950">
          Ketentuan Akad Donasi &amp; Penyaluran Zakat
        </h2>
        <p className="text-sm font-normal text-slate-600 mt-0.5 leading-relaxed">
          Prinsip syariat, tata kelola amanah, dan hak donatur dalam setiap penyaluran program yayasan.
        </p>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {AKAD_RULES.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.title}
              className="flex items-start gap-3.5 p-3.5 rounded-lg border border-slate-100 bg-slate-50/40"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
