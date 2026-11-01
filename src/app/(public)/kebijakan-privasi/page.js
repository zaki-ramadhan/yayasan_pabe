import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Komitmen perlindungan data pribadi donatur, transparansi pemrosesan, dan kepatuhan penuh terhadap Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).",
};

const PRIVACY_SECTIONS = [
  {
    title: "1. Komitmen perlindungan data pribadi",
    paragraphs: [
      "Yayasan Payung Berkah (PABE) berkomitmen penuh dalam menjaga kerahasiaan, integritas, dan keamanan seluruh data pribadi donatur, relawan, dan mitra lembaga.",
      "Seluruh tata kelola dan pemrosesan data diselenggarakan dengan berpedoman pada ketentuan Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
    ],
  },
  {
    title: "2. Data yang kami kumpulkan",
    paragraphs: [
      "Untuk mendukung kelancaran layanan donasi dan akuntabilitas pelaporan, kami menghimpun data terbatas yang mencakup:",
    ],
    list: [
      "Data akun & profil: Nama lengkap pengguna, alamat email aktif, nomor WhatsApp/telepon, serta kata sandi yang tersimpan dalam format hash terenkripsi satu arah.",
      "Data transaksi donasi: Nominal donasi, program amanah yang dituju, waktu transaksi, kanal pembayaran resmi, dan status penerbitan e-Kwitansi.",
      "Kerahasiaan finansial: Yayasan tidak pernah meminta, melihat, ataupun menyimpan nomor kartu debit/kredit, PIN perbankan, maupun kata sandi e-wallet. Seluruh transaksi diproses langsung oleh payment gateway resmi berizin Bank Indonesia.",
    ],
  },
  {
    title: "3. Tujuan pemrosesan informasi",
    paragraphs: [
      "Informasi pribadi yang dihimpun dipergunakan secara amanah untuk kebutuhan operasional berikut:",
    ],
    list: [
      "Memvalidasi transaksi donasi dan menerbitkan bukti e-Kwitansi sah sebagai pertanggungjawaban donatur.",
      "Menyalurkan laporan kabar penyaluran program mustahik secara berkala kepada donatur yang bersangkutan.",
      "Mencegah tindakan penipuan, penyalahgunaan identitas akun (anti-impersonation), dan menjaga keandalan sistem.",
      "Menjamin bahwa data pribadi Anda tidak akan pernah dijual, disewakan, atau dibagikan kepada pihak ketiga untuk kepentingan komersial maupun periklanan.",
    ],
  },
  {
    title: "4. Hak donasi anonim (Hamba Allah)",
    paragraphs: [
      "Kami menghormati niat ikhlas dan privasi spiritual para donatur. Pada setiap formulir donasi, Anda dapat mengaktifkan opsi donasi anonim:",
    ],
    list: [
      "Identitas Anda akan ditampilkan sebagai 'Hamba Allah' pada daftar donatur publik di halaman kampanye maupun feed situs web.",
      "Rekam transaksi dan bukti e-Kwitansi tetap tersimpan secara privat dan sah pada dasbor akun donatur Anda.",
    ],
  },
  {
    title: "5. Kebijakan cookie & sesi autentikasi",
    paragraphs: [
      "Platform kami menerapkan tata kelola sesi teknis yang aman demi kenyamanan akses pengguna:",
    ],
    list: [
      "Cookie sesi teknis: Menggunakan atribut keamanan standar tinggi (HttpOnly, Secure, SameSite=Lax) untuk memverifikasi autentikasi saat masuk.",
      "Fitur ingat saya: Menyimpan pengenal sesi terenkripsi selama 30 hari pada perangkat pribadi Anda (atau 7 hari jika opsi tidak dicentang).",
      "Bebas pelacak pihak ketiga: Kami tidak menggunakan cookie pelacak pihak ketiga (third-party tracking cookies) yang memantau riwayat penjelajahan di luar situs yayasan.",
    ],
  },
  {
    title: "6. Keamanan penyimpanan data",
    paragraphs: [
      "Perlindungan data donatur diselenggarakan melalui standar pengamanan berlapis:",
    ],
    list: [
      "Enkripsi transport: Seluruh pertukaran data dilindungi protokol enkripsi modern SSL/TLS berstandar industri.",
      "Hak akses terbatas: Akses terhadap database operasional hanya diberikan kepada staf pengurus yang berwenang dan terikat pakta integritas kerahasiaan.",
    ],
  },
  {
    title: "7. Hak donatur & saluran komunikasi",
    paragraphs: [
      "Sebagai pemilik data pribadi, Anda memiliki hak penuh terhadap informasi yang terdaftar:",
    ],
    list: [
      "Pemeriksaan & pembaruan: Anda berhak memeriksa, memperbarui profil, mengubah nomor kontak, atau mengajukan permohonan penonaktifan akun melalui dasbor donatur.",
      "Saluran layanan: Apabila memiliki pertanyaan atau kendala seputar privasi data, Anda dapat menghubungi sekretariat yayasan melalui email resmi atau kontak WhatsApp layanan yayasan.",
    ],
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <div className="w-full">
      <InformationHeroHeader
        title="Kebijakan Privasi"
        description="Komitmen keterbukaan dan perlindungan data pribadi donatur sesuai ketentuan Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022)."
        imageAlt="Latar Belakang Kebijakan Privasi Yayasan Payung Berkah"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-2xs divide-y divide-slate-100">
          {/* Header & Pengantar Kebijakan */}
          <div className="pb-6 sm:pb-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-950">
              Prinsip amanah &amp; keterbukaan data
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Terakhir diperbarui: 21 Oktober 2026
            </p>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              Kebijakan ini menjelaskan bagaimana Yayasan Payung Berkah menghimpun, mengelola, dan melindungi data pribadi yang Anda percayakan kepada kami saat menggunakan layanan platform donasi digital.
            </p>
          </div>

          {/* Konten Poin Kebijakan Privasi Terpadu */}
          <div className="pt-6 sm:pt-8 space-y-8">
            {PRIVACY_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  {section.title}
                </h3>

                {/* Konten Menjorok ke Dalam (Indented) */}
                <div className="pl-4 sm:pl-6 space-y-3">
                  {section.paragraphs?.map((paragraph, idx) => (
                    <p key={idx} className="text-sm text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  {section.list && (
                    <ul className="list-disc list-outside pl-4 space-y-2 text-sm text-slate-600 leading-relaxed marker:text-slate-400">
                      {section.list.map((item, idx) => {
                        const colonIndex = item.indexOf(":");
                        if (colonIndex > 0 && colonIndex < 40) {
                          const label = item.slice(0, colonIndex);
                          const desc = item.slice(colonIndex + 1);
                          return (
                            <li key={idx}>
                              <strong className="font-medium text-slate-800">{label}:</strong>
                              <span>{desc}</span>
                            </li>
                          );
                        }
                        return <li key={idx}>{item}</li>;
                      })}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
