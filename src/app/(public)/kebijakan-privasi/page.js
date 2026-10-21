import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";
import { ShieldCheck, Lock, UserCheck, EyeOff, Cookie, FileText, Mail } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Komitmen perlindungan data pribadi donatur, transparansi pemrosesan, dan kepatuhan penuh terhadap Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).",
};

const PRIVACY_SECTIONS = [
  {
    icon: ShieldCheck,
    title: "1. Komitmen perlindungan data pribadi",
    content: [
      "Yayasan Generasi Sejahtera Mandiri (Yayasan PABE) berkomitmen menjaga kerahasiaan, integritas, dan keamanan seluruh data pribadi donatur, relawan, dan mitra kami.",
      "Seluruh tata kelola dan pemrosesan informasi pribadi diselenggarakan dengan mengacu pada Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
    ],
  },
  {
    icon: FileText,
    title: "2. Data yang kami kumpulkan",
    content: [
      "Data Akun & Profil: Nama pengguna, alamat email aktif, nomor WhatsApp/telepon, serta kata sandi yang tersimpan dalam format hash terenkripsi satu arah.",
      "Data Transaksi Donasi: Nominal donasi, program target penyaluran, waktu donasi, metode pembayaran, dan status penerbitan e-Kwitansi.",
      "Kerahasiaan Finansial: Yayasan tidak pernah meminta, melihat, ataupun menyimpan nomor kartu debit/kredit, PIN perbankan, maupun kata sandi dompet digital donatur. Seluruh pembayaran diproses langsung oleh payment gateway resmi berizin Bank Indonesia.",
    ],
  },
  {
    icon: UserCheck,
    title: "3. Tujuan pemrosesan informasi",
    content: [
      "Memvalidasi transaksi donasi dan menerbitkan bukti e-Kwitansi resmi sebagai pertanggungjawaban donatur.",
      "Menyalurkan laporan perkembangan program bantuan mustahik secara berkala kepada donatur yang bersangkutan.",
      "Mencegah tindakan penipuan, penyalahgunaan identitas akun (anti-impersonation), dan menjaga keandalan sistem.",
      "Yayasan menjamin bahwa data pribadi Anda tidak akan pernah dijual, disewakan, atau dibagikan kepada pihak ketiga untuk kepentingan komersial maupun periklanan.",
    ],
  },
  {
    icon: EyeOff,
    title: "4. Hak donasi anonim (Hamba Allah)",
    content: [
      "Kami menghormati niat ikhlas dan privasi spiritual donatur. Pada setiap formulir donasi, Anda dapat mencentang opsi donasi anonim ('Hamba Allah').",
      "Nama Anda tidak akan ditampilkan pada daftar donatur publik di halaman kampanye maupun feed donasi situs web. Sistem tetap mencatat transaksi secara sah di dasbor pribadi donatur.",
    ],
  },
  {
    icon: Cookie,
    title: "5. Kebijakan cookie & sesi autentikasi",
    content: [
      "Platform kami menggunakan cookie sesi teknis berkeamanan tinggi (HttpOnly, Secure, SameSite=Lax) untuk memverifikasi autentikasi saat Anda masuk.",
      "Fitur 'Ingat saya' pada halaman masuk menyimpan pengenal sesi terenkripsi selama 30 hari untuk kenyamanan akses pada perangkat pribadi Anda. Jika tidak dicentang, sesi akan berakhir dalam 7 hari.",
      "Kami tidak menggunakan cookie pelacak pihak ketiga (third-party tracking cookies) yang memantau riwayat penjelajahan Anda di luar situs yayasan.",
    ],
  },
  {
    icon: Lock,
    title: "6. Keamanan penyimpanan data",
    content: [
      "Data transaksi dan identitas disimpan di server berstandar industri dengan pengamanan berlapis, enkripsi transport (SSL/TLS), serta pembatasan hak akses staf yang ketat.",
      "Hanya petugas yayasan yang berwenang dan terikat pakta kerahasiaan integritas yang memiliki izin untuk memverifikasi data penyaluran donasi.",
    ],
  },
  {
    icon: Mail,
    title: "7. Hak donatur & saluran komunikasi",
    content: [
      "Anda berhak memeriksa, memperbarui profil, mengubah nomor kontak, atau mengajukan permohonan penonaktifan akun melalui halaman profil donatur.",
      "Jika Anda memiliki pertanyaan atau kendala seputar privasi data, silakan hubungi tim administrasi kami melalui email resmi atau kontak WhatsApp layanan yayasan.",
    ],
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <div className="w-full">
      <InformationHeroHeader
        title="Kebijakan Privasi"
        description="Komitmen keterbukaan dan perlindungan data pribadi donatur sesuai ketentuan Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022)."
        imageAlt="Latar Belakang Kebijakan Privasi Yayasan Generasi Sejahtera Mandiri"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-semibold text-slate-950">
            Prinsip Amanah &amp; Keterbukaan Data
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Terakhir diperbarui: 21 Oktober 2026. Kebijakan ini menjelaskan bagaimana Yayasan Generasi Sejahtera Mandiri menghimpun, mengelola, dan melindungi data pribadi yang Anda percayakan kepada kami saat menggunakan layanan platform donasi digital.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {PRIVACY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    {section.title}
                  </h3>
                </div>

                <div className="space-y-2 pl-0 sm:pl-11 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
