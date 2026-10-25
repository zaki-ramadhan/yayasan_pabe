export const ARTICLE_CATEGORIES = [
  { id: "all", name: "Semua Kategori" },
  { id: "Edukasi Fiqih", name: "Edukasi Fiqih" },
  { id: "Zakat & Fiqih", name: "Zakat & Fiqih" },
  { id: "Kisah Inspiratif", name: "Kisah Inspiratif" },
  { id: "Kajian Wakaf", name: "Kajian Wakaf" },
  { id: "Kabar Lapangan", name: "Kabar Lapangan" },
  { id: "Kewirausahaan", name: "Kewirausahaan" },
  { id: "Opini", name: "Opini" },
  { id: "Literasi Keuangan", name: "Literasi Keuangan" },
  { id: "Sosial Masyarakat", name: "Sosial Masyarakat" },
  { id: "Kemanusiaan", name: "Kemanusiaan" },
];

/**
 * Validasi batasan kategori artikel:
 * - Minimal 1 kategori
 * - Maksimal 3 kategori berbeda
 * @param {string[]|string} categories
 * @returns {string[]} Array kategori unik (1-3 kategori)
 */
export function validateArticleCategories(categories) {
  const rawList = Array.isArray(categories)
    ? categories
    : typeof categories === "string" && categories.trim()
    ? [categories.trim()]
    : [];

  const uniqueList = Array.from(
    new Set(rawList.map((c) => (typeof c === "string" ? c.trim() : "")).filter(Boolean))
  );

  if (uniqueList.length < 1) {
    throw new Error("Artikel wajib memiliki minimal 1 kategori. Tidak boleh kosong.");
  }

  if (uniqueList.length > 3) {
    throw new Error("Artikel hanya boleh memiliki maksimal 3 kategori berbeda.");
  }

  return uniqueList;
}

export const ARTICLES = [
  {
    id: "art-1",
    slug: "keutamaan-sedekah-subuh",
    title: "Keutamaan Sedekah Subuh: Doa Dua Malaikat untuk Pembuka Pintu Rezeki",
    category: "Edukasi Fiqih",
    tags: ["Sedekah Subuh", "Fiqih", "Rezeki", "Amalan Pagi"],
    bannerUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Santri Bina Insan Mandiri / Unsplash",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Mengapa waktu subuh menjadi waktu paling istimewa untuk berinfak? Simak ulasan hadits shahih mengenai doa malaikat bagi orang yang gemar bersedekah di pagi hari.",
    content: `Sedekah subuh memiliki keistimewaan luar biasa dalam ajaran Islam. Dari Abu Hurairah radhiyallahu 'anhu, Rasulullah shallallahu 'alaihi wa sallam bersabda:

"Tidak ada satu subuh pun yang dialami hamba-hamba Allah melainkan ada dua malaikat yang turun. Salah satu dari keduanya berdoa: 'Ya Allah, berikanlah ganti bagi orang yang berinfak.' Sedangkan yang satu lagi berdoa: 'Ya Allah, berikanlah kehancuran bagi orang yang menahan hartanya.'" (HR. Bukhari dan Muslim).

Waktu fajar merupakan saat di mana para malaikat malam dan siang berkumpul menyaksikan hamba yang bersujud dan berbuat kebaikan. Ketika seorang mukmin menyisihkan sebagian rezekinya di awal hari, ia mengawali harinya dengan keberkahan dan doa mustajab para malaikat.

Amalan sedekah subuh kini dapat ditunaikan secara mudah melalui kanal digital Yayasan PABE. Setiap donasi subuh langsung dialokasikan untuk sarapan santri penghafal Al-Qur'an dan kebutuhan pangan lansia dhuafa di pondok binaan.`,
    author: "Ust. M. Ridwan, Lc.",
    publishedAt: "2026-09-10T05:30:00+07:00",
    likeCount: 64,
    dislikeCount: 1,
  },
  {
    id: "art-2",
    slug: "cara-hitung-zakat-penghasilan",
    title: "Panduan Praktis Menghitung Zakat Penghasilan & Nisab Emas 85 Gram",
    category: "Zakat & Fiqih",
    tags: ["Zakat Penghasilan", "Nisab Emas", "Fiqih", "Konsultasi Syariah"],
    bannerUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Syariah & Literasi Zakat PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Berapa batas nisab zakat profesi tahun 2026 dan bagaimana rumus perhitungannya bila ada cicilan rutin? Temukan panduan lengkap dan akurat di sini.",
    content: `Zakat penghasilan atau zakat profesi adalah zakat yang dikeluarkan dari penghasilan yang diperoleh dari profesi atau pekerjaan halal, baik berupa gaji bulanan, honorarium, bonus, maupun komisi profesional.

Berdasarkan fatwa MUI dan Keputusan BAZNAS RI, nisab zakat penghasilan dianalogikan dengan zakat emas yaitu setara dengan 85 gram emas per tahun (atau sekitar 7,08 gram emas per bulan).

Kadar zakat yang wajib dikeluarkan adalah sebesar 2,5% dari total penghasilan kotor atau penghasilan bersih setelah dikurangi kebutuhan pokok primer dan utang jatuh tempo.

Rumus Praktis:
- Total Penghasilan Bersih Bulanan x 2,5% = Kewajiban Zakat Bulanan.

Jika penghasilan Anda telah mencapai nisab bulanan, menunaikan zakat profesi sesegera mungkin saat menerima gaji adalah langkah terbaik untuk membersihkan harta dan menjemput keberkahan yang berlipat ganda.`,
    author: "Dewan Syariah PABE",
    publishedAt: "2026-09-05T09:15:00+07:00",
    likeCount: 48,
    dislikeCount: 0,
  },
  {
    id: "art-3",
    slug: "kisah-santri-penghafal-quran-pelosok",
    title: "Kisah Perjuangan Santri Dhuafa Menghafal 30 Juz di Pelosok Banten",
    category: "Kisah Inspiratif",
    tags: ["Santri Penghafal Quran", "Pendidikan", "Kisah Inspiratif", "Yatim Dhuafa"],
    bannerUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Program Pendidikan PABE Banten",
    imageSourceUrl: null,
    excerpt: "Keterbatasan fasilitas dan jarak dari orang tua tak menyurutkan semangat santri binaan PABE untuk menyetorkan hafalan Al-Qur'an setiap ba'da subuh.",
    content: `Di lereng perbukitan Lebak Banten, lantunan ayat suci Al-Qur'an bersahutan setiap fajar menyingsing. Puluhan santri yatim dan dhuafa binaan Yayasan PABE memulai hari mereka dengan murajaah dan setoran hafalan baru.

Salah satunya adalah Ahmad (13 tahun), santri asal pelosok yang telah menyelesaikan 18 juz hafalan mutqin. Di tengah kesederhanaan asrama bambu, tekadnya untuk memakaikan mahkota kemuliaan bagi kedua orang tuanya di akhirat menjadi motivasi terbesarnya.

Berkat beasiswa penuh dan dukungan sarana belajar dari para donatur PABE, santri-santri seperti Ahmad kini dapat menuntut ilmu agama dan formal secara gratis tanpa dibebani biaya asrama maupun kitab.`,
    author: "Tim Redaksi PABE",
    publishedAt: "2026-08-28T14:00:00+07:00",
    likeCount: 112,
    dislikeCount: 2,
  },
  {
    id: "art-4",
    slug: "urgensi-wakaf-air-bersih",
    title: "Urgensi Wakaf Produktif & Sarana Air Bersih untuk Kemandirian Umat",
    category: "Kajian Wakaf",
    tags: ["Wakaf Air Bersih", "Sumur Bor", "Amal Jariyah", "Kajian Wakaf"],
    bannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Program Wakaf Air Bersih PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Air bersih adalah kebutuhan mendasar yang mengalirkan pahala jariyah abadi. Mengapa wakaf sumur menjadi amalan yang sangat dianjurkan Rasulullah SAW?",
    content: `Ketika Sa'ad bin 'Ubadah radhiyallahu 'anhu bertanya kepada Rasulullah shallallahu 'alaihi wa sallam: "Sedekah apa yang paling utama?" Rasulullah menjawab: "Memberi air (minum)." (HR. Abu Dawud dan An-Nasa'i).

Wakaf sumur bor dan fasilitas sanitasi MCK komunal di desa-desa pelosok yang mengalami krisis kekeringan bukan hanya membebaskan warga dari kesulitan fisik, tetapi juga menjadi instrumen pemberdayaan ekonomi dan kesehatan jangka panjang.

Setiap liter air yang digunakan untuk berwudhu, memasak, dan kebutuhan harian masyarakat akan menjadi aliran kebaikan tanpa henti bagi waqif (pemberi wakaf) bahkan setelah wafat.`,
    author: "Dr. H. Ahmad Syafi'i, M.A.",
    publishedAt: "2026-08-20T10:45:00+07:00",
    likeCount: 37,
    dislikeCount: 0,
  },
  {
    id: "art-5",
    slug: "laporan-lapangan-tanggap-darurat-demak",
    title: "Laporan Lapangan: Penyaluran Bantuan Sembako & Dapur Umum Banjir Demak",
    category: "Kabar Lapangan",
    tags: ["Banjir Demak", "Tanggap Darurat", "Kabar Lapangan", "Sembako"],
    bannerUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Relawan Tanggap Bencana Demak",
    imageSourceUrl: null,
    excerpt: "Tim Siaga Bencana PABE menyalurkan 2.000 paket sembako, makanan siap saji, dan posko medis darurat untuk warga terdampak genangan banjir.",
    content: `Banjir yang melanda beberapa kecamatan di Kabupaten Demak dan sekitarnya memutus akses logistik warga selama lebih dari sepekan. Tim Tanggap Bencana PABE segera bergerak mendirikan Posko Dapur Umum Mandiri di titik pengungsian utama.

Selain mendistribusikan 500 porsi makanan hangat setiap hari, relawan juga menyalurkan paket kebersihan (hygiene kit), selimut, popok bayi, dan obat-obatan esensial bersama dinas sosial dan BPBD setempat.

Kami mengucapkan terima kasih yang sebesar-besarnya kepada seluruh muhsinin yang telah bergerak cepat menyalurkan sedekah darurat melalui Yayasan PABE.`,
    author: "Bagas Pratama (Relawan PABE)",
    publishedAt: "2026-08-14T16:20:00+07:00",
    likeCount: 89,
    dislikeCount: 1,
  },
  {
    id: "art-6",
    slug: "perbedaan-fidyah-kifarat-zakat-fitrah",
    title: "Memahami Perbedaan Fidyah, Kifarat, dan Zakat Fitrah dalam Mazhab Syafi'i",
    category: "Edukasi Fiqih",
    tags: ["Fidyah", "Kifarat", "Zakat Fitrah", "Fiqih"],
    bannerUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Kajian Fiqih & Dakwah PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Banyak umat muslim masih keliru membedakan kewajiban fidyah puasa, denda kifarat, dan zakat fitrah. Simak rangkuman hukum syariah berikut.",
    content: `Dalam fiqih ibadah, terdapat beberapa instrumen pembayaran kewajiban harta yang memiliki sebab, ketentuan penerima, dan takaran yang berbeda:

1. Zakat Fitrah: Kewajiban individu di bulan Ramadhan untuk mensucikan jiwa orang yang berpuasa dan mencukupi kaum miskin di hari raya Idul Fitri (takaran 1 sha' atau ~2,5-3 kg makanan pokok).
2. Fidyah Puasa: Pengganti bagi mereka yang tidak mampu berpuasa karena uzur syar'i permanen seperti lansia renta atau sakit menahun yang tidak diharapkan sembuhnya (takaran 1 mud / ~675 gram beras per hari).
3. Kifarat: Tebusan atau denda atas pelanggaran syariat tertentu, seperti melanggar sumpah (kifarat yamin) atau pelanggaran puasa tertentu.

Melalui layanan konsultasi syariah dan kalkulator zakat online Yayasan PABE, Anda dapat memastikan setiap kewajiban fiqih ditunaikan dengan takaran yang tepat dan disalurkan kepada mustahik yang berhak.`,
    author: "Ust. Fahrur Rozi, S.Pd.I",
    publishedAt: "2026-08-02T08:00:00+07:00",
    likeCount: 53,
    dislikeCount: 0,
  },
  {
    id: "art-7",
    slug: "membangun-kemandirian-ekonomi-dhuafa",
    title: "Membangun Kemandirian Ekonomi Keluarga Dhuafa Melalui Modal Usaha Bergulir Syariah",
    category: "Kewirausahaan",
    tags: ["UMKM Syariah", "Pemberdayaan", "Modal Bergulir", "Ekonomi Umat"],
    bannerUrl: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Program Pemberdayaan UMKM Mandiri",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Inkubasi bisnis mikro dan permodalan tanpa bunga (Qardhul Hasan) terbukti mampu melepaskan puluhan keluarga mustahik dari jerat kemiskinan dan rentenir.",
    content: `Program Kemandirian Ekonomi PABE menerapkan pendekatan pendampingan holistik: bantuan permodalan tanpa riba (akad Qardhul Hasan), pelatihan manajemen keuangan dasar, dan kurasi produk UMKM olahan pangan.

Dalam siklus 6 bulan pendampingan, penerima manfaat tidak hanya didorong meningkatkan omset penjualan, namun juga dibimbing untuk menyisihkan tabungan infaq harian sebagai bentuk pembiasaan sedekah saat telah berdaya.

Hingga kuartal kedua 2026, lebih dari 65 pedagang keliling dan warung rumahan di wilayah binaan berhasil mandiri dan lulus dari status mustahik menjadi muzakki baru.`,
    author: "Ir. Hendri Gunawan, M.M.",
    publishedAt: "2026-07-25T11:10:00+07:00",
    likeCount: 76,
    dislikeCount: 0,
  },
  {
    id: "art-8",
    slug: "optimalisasi-dana-ziswaf-pengentasan-kemiskinan",
    title: "Optimalisasi Dana ZISWAF sebagai Pengungkit Pengentasan Kemiskinan Ekstrem",
    category: "Opini",
    tags: ["ZISWAF", "Opini", "Filantropi Islam", "Kemiskinan"],
    bannerUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    imageSource: "Kajian Kebijakan Sosial & Filantropi Islam PABE",
    imageSourceUrl: null,
    excerpt: "Transformasi penyaluran zakat dari pola konsumtif sesaat menjadi produktif terukur adalah kunci utama pemerataan kesejahteraan sosial nasional.",
    content: `Filantropi Islam memiliki potensi dana triliunan rupiah yang jika dikelola secara transparan dan berbasis data akurat dapat menjadi pilar pelengkap APBN dalam mengentaskan kemiskinan ekstrem.

Penyaluran zakat tidak boleh berhenti pada pemberian sembako sekali habis. Alokasi dana ZISWAF wajib diarahkan pada investasi sumber daya manusia—seperti beasiswa vokasi bagi anak dhuafa dan sanitasi pemukiman kumuh.

Akuntabilitas digital dan audit berkala menjadi benteng utama agar kepercayaan publik terhadap lembaga amil zakat semakin kokoh.`,
    author: "Drs. KH. Mahmud Syakir",
    publishedAt: "2026-07-18T13:45:00+07:00",
    likeCount: 94,
    dislikeCount: 2,
  },
  {
    id: "art-9",
    slug: "cerdas-kelola-cashflow-keluarga-muda-syariah",
    title: "Cerdas Mengelola Cash Flow Finansial Keluarga Muda Sesuai Kaidah Fiqih Muamalah",
    category: "Literasi Keuangan",
    tags: ["Keuangan Syariah", "Keluarga Sakinah", "Literasi Keuangan", "Investasi"],
    bannerUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Kelas Edukasi Finansial Syariah PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Bagaimana cara membagi alokasi 50-30-20 versi syariah yang mengedepankan hak zakat, dana darurat, dan proteksi dari transaksi gharar maupun riba?",
    content: `Mengelola keuangan rumah tangga dalam pandangan Islam bukan sekadar menimbun aset, melainkan menyeimbangkan antara hak diri, keluarga, dan hak kaum dhuafa yang melekat pada rezeki kita.

Pola alokasi syariah yang dianjurkan:
1. 10% Pos Kebaikan & ZISWAF (Zakat wajib 2,5%, sedekah harian, dan infaq dakwah).
2. 50% Pos Kebutuhan Pokok Halalan Thayyiban.
3. 20% Pos Dana Darurat & Tabungan Investasi Bebas Riba.
4. 20% Pos Cicilan Produktif / Pengembangan Diri.

Dengan menjaga proporsi infaq di awal penerimaan penghasilan, keberkahan pengeluaran bulanan akan terasa lebih lapang dan terjauh dari sifat boros.`,
    author: "Safira Annisa, CFP, AEPP",
    publishedAt: "2026-07-10T09:00:00+07:00",
    likeCount: 82,
    dislikeCount: 1,
  },
  {
    id: "art-10",
    slug: "gotong-royong-komunitas-berbagi-beras",
    title: "Gotong Royong Komunitas: Mengapa Gerakan Berbagi Beras Efektif Atasi Kerawanan Pangan",
    category: "Sosial Masyarakat",
    tags: ["Berbagi Beras", "Ketahanan Pangan", "Lansia Dhuafa", "Sosial"],
    bannerUrl: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Gerakan Sedekah Beras Mandiri",
    imageSourceUrl: null,
    excerpt: "Distribusi beras kualitas premium 5 kg rutin setiap awal bulan bagi lansia sebatang kara dan janda dhuafa menghadirkan ketenangan hidup.",
    content: `Bagi keluarga prasejahtera, kepastian adanya beras di dapur adalah ketenangan batin terbesar. Gerakan ATM Beras dan Distribusi Pangan Rutin PABE menjangkau 400 kepala keluarga rentan di berbagai pelosok desa.

Program ini melibatkan perangkat RT/RW dan pengurus masjid setempat untuk memvalidasi data mustahik secara berkala, memastikan tidak ada warga yang luput dari perhatian lingkungan sekitarnya.

Melalui infaq beras Rp 15.000 per kilogram, para donatur telah membantu tersedianya nasi hangat di meja makan saudara-saudara kita yang membutuhkan.`,
    author: "Zulfikar Hidayat (Koordinator Lapangan)",
    publishedAt: "2026-07-02T15:30:00+07:00",
    likeCount: 68,
    dislikeCount: 0,
  },
  {
    id: "art-11",
    slug: "aksi-relawan-medis-merawat-lansia-wilayah-terisolir",
    title: "Aksi Relawan Medis PABE: Merawat Lansia Dhuafa dan Balita di Wilayah Terisolir",
    category: "Kemanusiaan",
    tags: ["Klinik Keliling", "Layanan Kesehatan", "Relawan Medis", "Kemanusiaan"],
    bannerUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Tim Medis Mandiri Peduli",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Menembus medan perbukitan terjal, tim dokter dan perawat relawan menggelar cek kesehatan gratis dan pembagian vitamin untuk warga desa tanpa puskesmas pembantu.",
    content: `Akses kesehatan primer masih menjadi tantangan bagi masyarakat di dusun-dusun pelosok. Melalui mobil klinik keliling PABE, layanan pemeriksaan gula darah, tensi, konsultasi dokter, dan obat-obatan dasar diberikan tanpa dipungut biaya sepeser pun.

Selain pengobatan umum, tim relawan juga melakukan skrining tumbuh kembang anak guna mencegah potensi stunting pada balita dari keluarga prasejahtera.

Kesehatan adalah modal utama mustahik untuk dapat kembali beraktivitas dan bekerja mencari nafkah secara mandiri.`,
    author: "dr. Nurul Izzati",
    publishedAt: "2026-06-25T14:20:00+07:00",
    likeCount: 105,
    dislikeCount: 1,
  },
  {
    id: "art-12",
    slug: "adab-dan-fiqih-berinfaq-ikhlas-tanpa-riya",
    title: "Adab dan Fiqih Berinfaq: Menjaga Keikhlasan dan Menghindari Riya dalam Bersedekah",
    category: "Edukasi Fiqih",
    tags: ["Adab Sedekah", "Ikhlas", "Fiqih", "Tazkiyatun Nafs"],
    bannerUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Kajian Fiqih Hati PABE",
    imageSourceUrl: null,
    excerpt: "Pahala sedekah yang besar dapat gugur seketika akibat sifat mengungkit-ungkit (al-mann) dan menyakiti perasaan penerima (al-adza). Pelajari adab syar'inya.",
    content: `Allah Subhanahu wa Ta'ala berfirman dalam Surah Al-Baqarah ayat 264: "Wahai orang-orang yang beriman, janganlah kamu menghilangkan pahala sedekahmu dengan menyebut-nyebutnya dan menyakiti (perasaan si penerima)..."

Adab-adab utama dalam berinfaq:
1. Mengharapkan semata-mata ridha Allah, bukan pujian publik.
2. Memberikan harta dari hasil yang halal dan yang paling kita sukai kualitasnya.
3. Menjaga martabat mustahik agar tidak merasa rendah diri saat menerima bantuan.
4. Menyegerakan pengeluaran sedekah saat hati tergerak berbuat kebaikan.

Platform donasi digital Yayasan PABE menyediakan fitur donasi anonim ("Hamba Allah") untuk membantu para donatur menjaga privasi dan kebersihan niat sedekahnya.`,
    author: "Ust. M. Ridwan, Lc.",
    publishedAt: "2026-06-18T06:15:00+07:00",
    likeCount: 59,
    dislikeCount: 0,
  },
  {
    id: "art-13",
    slug: "zakat-saham-reksadana-investasi-modern",
    title: "Zakat Saham, Reksa Dana, dan Investasi Modern: Hukum dan Simulasi Perhitungannya",
    category: "Zakat & Fiqih",
    tags: ["Zakat Saham", "Pasar Modal Syariah", "Zakat Investasi", "Fiqih Modern"],
    bannerUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Literasi Investasi Syariah PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Bagaimana cara menghitung zakat atas portofolio saham syariah yang disimpan untuk capital gain versus dividen rutin? Simak fatwa DSN-MUI berikut.",
    content: `Perkembangan instrumen investasi syariah melahirkan kebutuhan panduan fiqih zakat yang presisi. Para ulama kontemporer dan DSN-MUI mengklasifikasikan zakat saham menjadi dua kategori:

1. Saham Trading / Capital Gain: Diperlakukan seperti barang perniagaan ('urudh at-tijarah), dihitung dari nilai pasar portofolio pada saat haul (1 tahun hijriyah) dikalikan 2,5%.
2. Saham Investasi Jangka Panjang (Dividen): Zakat dikenakan pada saat dividen cair atau dari laba bersih operasional emiten setara 2,5%-10% tergantung sifat aset produktifnya.

Menunaikan zakat portofolio investasi merupakan ikhtiar menyucikan aset digital agar rezeki yang berputar senantiasa dinaungi keberkahan.`,
    author: "Dewan Syariah PABE",
    publishedAt: "2026-06-10T10:30:00+07:00",
    likeCount: 71,
    dislikeCount: 1,
  },
  {
    id: "art-14",
    slug: "dari-penjual-kerupuk-menjadi-sarjana",
    title: "Dari Penjual Kerupuk Keliling Menjadi Sarjana: Kisah Haru Penerima Beasiswa PABE",
    category: "Kisah Inspiratif",
    tags: ["Beasiswa Yatim", "Kisah Nyata", "Pendidikan Tinggi", "Inspirasi"],
    bannerUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Wisuda Beasiswa Sarjana PABE",
    imageSourceUrl: null,
    excerpt: "Ditinggal wafat sang ayah sejak usia 7 tahun tak mematahkan mimpi Fajar untuk meraih gelar Sarjana Teknik Informatika dengan predikat Cum Laude.",
    content: `Di sela-sela waktu sekolahnya dulu, Fajar menjajakan kerupuk keliling demi membantu ibunya menyambung hidup. Prestasinya yang cemerlang di bidang sains menarik perhatian tim seleksi Beasiswa PABE pada tahun 2022.

Selama 4 tahun menempuh kuliah, Fajar menerima pembiayaan SPP penuh, uang saku bulanan, serta pembinaan karakter kepemimpinan Islam di asrama mahasiswa binaan.

Kini, Fajar telah bekerja sebagai software engineer di perusahaan teknologi nasional dan berkomitmen menjadi orang tua asuh bagi 3 santri yatim di yayasan.`,
    author: "Tim Redaksi PABE",
    publishedAt: "2026-06-01T16:00:00+07:00",
    likeCount: 145,
    dislikeCount: 0,
  },
  {
    id: "art-15",
    slug: "wakaf-tanah-pesantren-amal-jariyah-abadi",
    title: "Wakaf Tanah Pesantren: Jejak Amal Jariyah Abadi yang Mengalirkan Berkah Tiada Akhir",
    category: "Kajian Wakaf",
    tags: ["Wakaf Tanah", "Pesantren Tahfidz", "Wakaf Produktif", "Jariyah"],
    bannerUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Pembebasan Lahan Pesantren PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Pembebasan lahan seluas 2.500 m² untuk pembangunan asrama santri dan masjid binaan membuka peluang wakaf uang mulai dari Rp 50.000 per meter persegi.",
    content: `Wakaf adalah instrumen sedekah abadi di mana pokok asetnya ditahan (tidak boleh dijual atau diwariskan), sedangkan manfaatnya terus dialirkan untuk kemaslahatan umum.

Lahan wakaf yang saat ini sedang dikembangkan oleh Yayasan PABE akan difungsikan sebagai kompleks terpadu:
- Pondok Tahfidz Al-Qur'an 30 Juz Gratis untuk santri dhuafa.
- Rumah Singgah Yatim dan Ruang Belajar Komputer.
- Kebun hidroponik produktif sebagai sumber pangan mandiri asrama.

Pahala kebaikan dari setiap lantunan ayat suci yang dibaca santri di atas tanah wakaf ini akan terus mengalir kepada para waqif hingga hari kiamat.`,
    author: "Dr. H. Ahmad Syafi'i, M.A.",
    publishedAt: "2026-05-22T08:40:00+07:00",
    likeCount: 91,
    dislikeCount: 1,
  },
  {
    id: "art-16",
    slug: "distribusi-logistik-longsor-jawa-tengah",
    title: "Distribusi Logistik Bencana Tanah Longsor Jawa Tengah: 1.200 Warga Terfasilitasi Posko Darurat",
    category: "Kabar Lapangan",
    tags: ["Tanggap Darurat", "Longsor", "Relawan Siaga", "Kabar Lapangan"],
    bannerUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Relawan Tanggap Bencana PABE",
    imageSourceUrl: null,
    excerpt: "Laporan penyaluran tenda darurat, selimut tebal, air mineral, dan paket obat-obatan untuk korban longsor di lereng perbukitan Jawa Tengah.",
    content: `Bencana longsor yang dipicu curah hujan ekstrem menimbun puluhan rumah warga dan memaksa ratusan jiwa mengungsi ke balai desa terdekat. Tim Tanggap Darurat PABE tiba di lokasi pada H+1 bencana membawa truk logistik darurat.

Bantuan yang telah tersalurkan mencakup:
- 300 paket sembako keluarga berisi beras, minyak, sarden, dan biskuit.
- 500 selimut wol dan matras tidur untuk lansia dan anak-anak.
- Layanan psikososial trauma healing bagi anak-anak pengungsi.

Penyaluran fase kedua akan difokuskan pada pengadaan sarana sanitasi darurat dan pembersihan material lumpur bersama warga.`,
    author: "Bagas Pratama (Relawan PABE)",
    publishedAt: "2026-05-15T17:15:00+07:00",
    likeCount: 77,
    dislikeCount: 1,
  },
  {
    id: "art-17",
    slug: "strategi-umkm-binaan-naik-kelas-digital",
    title: "Strategi UMKM Binaan Bertahan dan Naik Kelas di Era Digitalisasi Pasar",
    category: "Kewirausahaan",
    tags: ["Digital Marketing", "UMKM Binaan", "Kemandirian Usaha", "Ekonomi Syariah"],
    bannerUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Pelatihan Digital Marketing UMKM PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Pelatihan foto produk profesional lewat smartphone dan optimasi WhatsApp Bisnis terbukti mendongkrak penjualan produk mustahik binaan hingga 40%.",
    content: `Tantangan utama pedagang kecil di era modern adalah kemampuan beradaptasi dengan platform transaksi digital. Program Inkubasi Usaha PABE menyelenggarakan workshop praktis digital marketing bagi para pelaku usaha mikro.

Materi pelatihan meliputi:
1. Teknik memotret produk makanan yang higienis dan menarik.
2. Penggunaan QRIS untuk mempermudah pembayaran non-tunai.
3. Pengelolaan catatan kas digital sederhana untuk memisahkan uang pribadi dan uang modal.

Dengan bekal keterampilan digital ini, produk para mustahik binaan mampu menjangkau konsumen yang lebih luas di luar lingkungan rukun tetangga.`,
    author: "Ir. Hendri Gunawan, M.M.",
    publishedAt: "2026-05-05T10:00:00+07:00",
    likeCount: 63,
    dislikeCount: 0,
  },
  {
    id: "art-18",
    slug: "masa-depan-filantropi-islam-transparansi-integritas",
    title: "Menatap Masa Depan Filantropi Islam: Menjaga Transparansi dan Integritas Lembaga",
    category: "Opini",
    tags: ["Transparansi", "Audit Publik", "Good Governance", "Opini"],
    bannerUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Forum Dialog Filantropi Islam",
    imageSourceUrl: null,
    excerpt: "Keterbukaan laporan keuangan berstandar KAP independen dan pelaporan penyaluran real-time adalah harga mati dalam memelihara amanah muzakki.",
    content: `Kepercayaan publik adalah aset paling bernilai bagi sebuah lembaga filantropi. Di era keterbukaan informasi, masyarakat menuntut kejelasan setiap rupiah yang didonasikan: siapa penerimanya, berapa biayanya, dan apa dampak nyatanya.

Prinsip Good Amil Governance yang diterapkan di Yayasan PABE mewajibkan pemisahan tegas antara rekening dana donasi dan rekening operasional, serta publikasi laporan audit independen WTP setiap tahun.

Dengan tata kelola yang profesional, filantropi Islam akan diakui secara luas sebagai lokomotif utama pembangunan sosial yang berkeadilan.`,
    author: "Drs. KH. Mahmud Syakir",
    publishedAt: "2026-04-28T14:30:00+07:00",
    likeCount: 88,
    dislikeCount: 1,
  },
  {
    id: "art-19",
    slug: "persiapkan-dana-darurat-asuransi-syariah",
    title: "Mempersiapkan Dana Darurat dan Asuransi Syariah: Ikhtiar Proteksi Masa Depan Keluarga",
    category: "Literasi Keuangan",
    tags: ["Dana Darurat", "Takaful", "Perencanaan Finansial", "Syariah"],
    bannerUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Kelas Edukasi Finansial Syariah PABE",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Bagaimana konsep tolong-menolong (ta'awun) dalam takaful syariah menggantikan sistem transfer risiko konvensional untuk mengamankan ketahanan finansial.",
    content: `Islam mengajarkan umatnya untuk berikhtiar mempersiapkan diri menghadapi masa-masa sulit (ikhtiar wa tawakkal). Konsep dana darurat adalah perwujudan dari pesan Nabi Yusuf 'alaihissalam dalam mengelola cadangan gandum di masa panen.

Besaran dana darurat yang ideal:
- Lajang / Belum Menikah: 3–6 kali pengeluaran bulanan.
- Menikah dengan Anak: 6–12 kali pengeluaran bulanan.

Instrumen proteksi berbasis syariah menggunakan akad Tabarru' (hibah kebajikan) di mana sesama peserta saling menolong saat ada anggota yang tertimpa musibah sakit atau kematian kepala keluarga.`,
    author: "Safira Annisa, CFP, AEPP",
    publishedAt: "2026-04-15T11:00:00+07:00",
    likeCount: 66,
    dislikeCount: 0,
  },
  {
    id: "art-20",
    slug: "solidaritas-paket-gizi-cegah-stunting-pelosok",
    title: "Solidaritas Tanpa Batas: Menyalurkan Paket Gizi Balita Stunting di Pelosok Negeri",
    category: "Kemanusiaan",
    tags: ["Cegah Stunting", "Gizi Balita", "Ibu & Anak", "Kemanusiaan"],
    bannerUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    imageSource: "Dokumentasi Program Gizi Mandiri Ibu & Balita",
    imageSourceUrl: "https://unsplash.com",
    excerpt: "Intervensi pangan bergizi tinggi berupa telur, susu, kacang hijau, dan suplemen mikronutrien bagi 250 anak balita dari keluarga prasejahtera.",
    content: `Periode 1.000 Hari Pertama Kehidupan (HPK) adalah masa emas yang menentukan kecerdasan dan masa depan seorang anak. Kekurangan nutrisi pada fase ini berisiko menyebabkan gangguan pertumbuhan fisik dan kognitif permanen.

Program Dapur Gizi Sehat PABE bekerja sama dengan bidan desa membagikan paket pangan padat nutrisi setiap dua pekan sekali, disertai edukasi pola makan sehat bagi para ibu muda.

Hasil evaluasi setelah 3 bulan intervensi menunjukkan peningkatan berat badan dan tinggi badan yang signifikan pada 85% balita penerima manfaat.`,
    author: "dr. Nurul Izzati",
    publishedAt: "2026-04-02T09:30:00+07:00",
    likeCount: 118,
    dislikeCount: 2,
  },
];

export { FAQS } from "./faqs.js";
