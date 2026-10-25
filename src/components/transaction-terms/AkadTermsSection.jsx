import { cn } from "@/lib/utils";

const AKAD_RULES = [
  {
    title: "Akad Wakalah Syariah",
    description:
      "Donatur memberikan mandat dan kuasa penuh (wakalah) kepada Yayasan untuk menghimpun, mengelola, serta menyalurkan dana amanah kepada mustahik yang berhak sesuai syariat Islam.",
  },
  {
    title: "Alokasi Zakat & Infak",
    description:
      "Dana zakat disalurkan secara khusus kepada 8 asnaf penerima zakat. Sedangkan dana infak dan sedekah difokuskan pada program pendidikan anak yatim, pemberdayaan ekonomi dhuafa, dan kemanusiaan.",
  },
  {
    title: "Bukti Transaksi & e-Kwitansi",
    description:
      "Setiap donasi yang berhasil diproses secara otomatis menerbitkan e-Kwitansi sah yang dapat diunduh pada riwayat donasi akun donatur sebagai bukti akuntabilitas resmi.",
  },
  {
    title: "Ketentuan Transaksi Berhasil",
    description:
      "Donasi yang telah berhasil dibayarkan bersifat tuntas dan langsung dialokasikan ke kas program amanah, sehingga tidak dapat dibatalkan atau ditarik kembali (non-refundable).",
  },
];

const CARD_VARIANTS = {
  blue: {
    container: "border border-blue-900/60 bg-[radial-gradient(ellipse_at_bottom_right,_#1e40af_0%,_#1e3a8a_50%,_#090e1a_100%)] text-white shadow-xs",
    title: "text-white",
    desc: "text-blue-50/90",
  },
  slate: {
    container: "border border-slate-700/60 bg-[radial-gradient(ellipse_at_bottom_right,_#475569_0%,_#1e293b_55%,_#020617_100%)] text-white shadow-xs",
    title: "text-white",
    desc: "text-slate-200/90",
  },
  white: {
    container: "border border-slate-200 bg-white text-slate-950 shadow-2xs",
    title: "text-slate-950",
    desc: "text-slate-600",
  },
};

const CARD_SCHEME = ["blue", "white", "white", "slate"];

/**
 * AkadTermsSection: Menampilkan prinsip akad syariah dan ketentuan donasi
 * Menggunakan 4 kartu terstruktur (2 background bertema, 2 background putih) tanpa icon.
 */
export function AkadTermsSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Ketentuan Akad Donasi &amp; Penyaluran Zakat
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {AKAD_RULES.map((rule, idx) => {
          const variantKey = CARD_SCHEME[idx] || "white";
          const styles = CARD_VARIANTS[variantKey];

          return (
            <div
              key={rule.title}
              className={cn("p-4 sm:p-5 rounded-lg space-y-1.5", styles.container)}
            >
              <h3 className={cn("text-sm sm:text-base font-semibold leading-snug", styles.title)}>
                {rule.title}
              </h3>
              <p className={cn("text-xs sm:text-sm leading-relaxed", styles.desc)}>
                {rule.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
