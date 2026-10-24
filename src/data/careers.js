export const LOCATION_OPTIONS = [
  "Semua Lokasi",
  "Jakarta Timur / Depok",
  "Jakarta Pusat / Selatan",
  "Remotely / Fleksibel",
];

export const TYPE_OPTIONS = [
  "Semua Tipe",
  "Penuh Waktu (Full-time)",
  "Paruh Waktu (Part-time)",
  "Kontrak / Project",
];

export const DEPARTMENT_OPTIONS = [
  "Semua Divisi",
  "Operasional & Penyaluran",
  "Keuangan & Akuntansi",
  "Komunikasi & Media",
  "Kemitraan & Fundraising",
  "Pendidikan & Dakwah",
];

/**
 * Menghitung secara dinamis apakah lowongan diposting pada hari ini (tanggal lokal)
 * @param {string} dateString - Format YYYY-MM-DD
 * @returns {boolean}
 */
export function isPostedToday(dateString) {
  if (!dateString) return false;
  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) return false;

  const today = new Date();
  return (
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate()
  );
}

export const CAREER_VACANCIES = [
  {
    id: "JOB-01",
    title: "Staff Divisi Program & Penyaluran",
    department: "Operasional & Penyaluran",
    location: "Jakarta Timur / Depok",
    type: "Penuh Waktu (Full-time)",
    workplace: "Hybrid",
    experience: "Minimal 1 tahun",
    publishedDate: "2026-09-22",
    postedAt: "Hari ini",
    applicantCount: 18,
    deadline: "30 Oktober 2026",
    applyUrl: "https://forms.gle/pabe-recruitment",
    overview:
      "Bertanggung jawab atas kelancaran logistik penyaluran bantuan sosial, santunan yatim, dan program ketahanan pangan masyarakat secara tepat sasaran, transparan, dan akuntabel.",
    responsibilities: [
      "Mengelola jadwal dan koordinasi logistik distribusi paket sembako dan bantuan tunai ke lokasi binaan",
      "Melakukan asesmen langsung terhadap calon mustahik dan kelayakan penerima manfaat sesuai standar syariat",
      "Menyusun berita acara serah terima bantuan beserta dokumentasi administrasi penyaluran lapangan",
      "Berkoordinasi dengan pengurus RT, RW, dan tokoh masyarakat setempat di wilayah distribusi",
      "Menyusun laporan bulanan capaian penyaluran program dan pertanggungjawaban dana donasi",
    ],
    requirements: [
      "Pendidikan minimal D3 atau S1 dari semua jurusan",
      "Memiliki kepedulian sosial tinggi dan integritas syar'i yang amanah",
      "Bersedia turun ke lapangan dan fleksibel bertugas saat aksi tanggap bencana",
      "Memiliki kemampuan komunikasi yang baik dengan masyarakat akar rumput",
      "Mampu mengoperasikan komputer dan aplikasi pelaporan dasar (Spreadsheet / Docs)",
      "Memiliki SIM C aktif dan kendaraan roda dua pribadi menjadi nilai tambah",
    ],
    benefits: [
      "Gaji pokok dan tunjangan operasional lapangan",
      "BPJS Kesehatan dan Ketenagakerjaan",
      "Lingkungan kerja islami yang kondusif dan suportif",
      "Kesempatan beramal jariyah melalui pengabdian kemanusiaan langsung",
    ],
  },
  {
    id: "JOB-02",
    title: "Akuntan & Staff Keuangan ZISWAF",
    department: "Keuangan & Akuntansi",
    location: "Jakarta Timur / Depok",
    type: "Penuh Waktu (Full-time)",
    workplace: "On-site",
    experience: "1 - 3 tahun",
    publishedDate: "2026-09-18",
    postedAt: "4 hari yang lalu",
    applicantCount: 12,
    deadline: "25 Oktober 2026",
    applyUrl: "https://forms.gle/pabe-recruitment",
    overview:
      "Mengelola pencatatan keuangan ZISWAF berdasarkan PSAK 109, rekonsiliasi kas dan rekening bank harian, serta menjamin kepatuhan audit keuangan yayasan secara berkala.",
    responsibilities: [
      "Melakukan rekonsiliasi harian mutasi rekening koran, QRIS donasi, dan virtual account donatur",
      "Menyusun jurnal umum, buku besar, dan laporan keuangan yayasan mengacu pada standar PSAK 109",
      "Mengelola penerbitan bukti setor zakat resmi (BSZ) dan administrasi e-Kwitansi donatur",
      "Mempersiapkan dokumen pendukung untuk keperluan audit internal dan Kantor Akuntan Publik (KAP)",
      "Memantau arus kas operasional yayasan dan mengajukan pencairan dana program sesuai SOP",
    ],
    requirements: [
      "Pendidikan S1 Akuntansi atau Keuangan Syariah",
      "Memahami prinsip dasar akuntansi zakat, infak, sedekah, dan wakaf (PSAK 109)",
      "Teliti, jujur, berintegritas tinggi, dan terbiasa bekerja dengan data angka",
      "Mahir mengoperasikan Microsoft Excel / Google Sheets tingkat menengah hingga mahir",
      "Fresh graduate dengan riwayat magang di lembaga amil zakat dipersilakan mendaftar",
    ],
    benefits: [
      "Remunerasi bulanan yang kompetitif",
      "Tunjangan kesehatan dan jaminan sosial lengkap",
      "Pelatihan berkala seputar fikih muamalah dan akuntansi filantropi Islam",
      "Ruang bertumbuh karier di institusi nirlaba profesional",
    ],
  },
  {
    id: "JOB-03",
    title: "Content Creator & Media Dakwah",
    department: "Komunikasi & Media",
    location: "Remotely / Fleksibel",
    type: "Kontrak / Project",
    workplace: "Remote",
    experience: "Minimal 1 tahun",
    publishedDate: "2026-09-15",
    postedAt: "1 pekan yang lalu",
    applicantCount: 29,
    deadline: "15 November 2026",
    applyUrl: "https://forms.gle/pabe-recruitment",
    overview:
      "Merancang narasi visual dakwah, liputan dokumenter kegiatan santri dan dhuafa, serta mengelola publikasi media sosial yayasan dengan estetika modern dan edukatif.",
    responsibilities: [
      "Membuat konten video pendek (Reels / TikTok / YouTube Shorts) bertema kisah inspiratif penerima manfaat",
      "Merancang infografis laporan transparansi penyaluran donasi bulanan bersama tim keuangan",
      "Menulis caption edukasi zakat dan ajakan kebaikan dengan gaya bahasa yang santun dan menyentuh",
      "Mengelola jadwal posting dan interaksi komentar di seluruh kanal sosial resmi yayasan",
      "Melakukan liputan foto dan video saat kegiatan penyaluran bantuan di lapangan jika diperlukan",
    ],
    requirements: [
      "Pendidikan minimal SMA/SMK atau D3/S1 di bidang Desain Grafis, Komunikasi, atau Multimedia",
      "Mahir menggunakan aplikasi editing (CapCut / Premiere Pro) dan desain (Canva / Figma / Illustrator)",
      "Memiliki portofolio video atau desain visual yang aktif dan relevan",
      "Memahami tren media sosial dengan tetap menjaga nilai etika dan adab dakwah Islam",
      "Mampu bekerja mandiri sesuai target tenggat waktu",
    ],
    benefits: [
      "Fee per project / honorarium bulanan yang kompetitif",
      "Waktu kerja fleksibel dan berbasis capaian hasil karya",
      "Akses materi liputan dan studio mini yayasan",
      "Pahala kebaikan melalui penyebaran syiar dakwah dan kepedulian",
    ],
  },
  {
    id: "JOB-04",
    title: "Fundraiser & Relationship Manager Kemitraan",
    department: "Kemitraan & Fundraising",
    location: "Jakarta Pusat / Selatan",
    type: "Penuh Waktu (Full-time)",
    workplace: "Hybrid",
    experience: "1 - 2 tahun",
    publishedDate: "2026-09-15",
    postedAt: "1 pekan yang lalu",
    applicantCount: 15,
    deadline: "5 November 2026",
    applyUrl: "https://forms.gle/pabe-recruitment",
    overview:
      "Membangun dan merawat kemitraan strategis dengan korporasi, komunitas muslim, dan instansi swasta dalam program CSR dan kolaborasi zakat perusahaan.",
    responsibilities: [
      "Menyusun proposal kemitraan program pemberdayaan dan CSR yang relevan bagi mitra korporasi",
      "Membangun relasi berkelanjutan dengan perwakilan donatur institusi dan komunitas donatur tetap",
      "Mengoordinasikan presentasi program yayasan kepada calon mitra korporat potensial",
      "Membuat laporan berkala pertanggungjawaban program khusus kemitraan korporat",
      "Menjajaki peluang kolaborasi baru melalui event, webinar, dan pameran filantropi",
    ],
    requirements: [
      "Pendidikan minimal D3 atau S1 di bidang Komunikasi, Manajemen, Hubungan Internasional, atau Pemasaran",
      "Memiliki kemampuan negosiasi, presentasi, dan interpersonal yang luwes dan profesional",
      "Memiliki pemahaman mengenai skema CSR dan program filantropi kemanusiaan",
      "Percaya diri, berpenampilan rapi, dan santun dalam berkomunikasi",
      "Pengalaman di lembaga amil zakat (LAZ) atau NGO nasional merupakan nilai tambah",
    ],
    benefits: [
      "Gaji pokok, tunjangan komunikasi, dan bonus insentif kemitraan",
      "Fasilitas transportasi operasional pertemuan mitra",
      "Jaringan relasi profesional luas dengan berbagai institusi terkemuka",
      "Kultur kerja kolaboratif dan berorientasi pada kebermanfaatan umat",
    ],
  },
  {
    id: "JOB-05",
    title: "Koordinator Pendidikan Tahfidz & Santri",
    department: "Pendidikan & Dakwah",
    location: "Jakarta Timur / Depok",
    type: "Penuh Waktu (Full-time)",
    workplace: "On-site",
    experience: "Minimal 2 tahun",
    publishedDate: "2026-09-08",
    postedAt: "2 pekan yang lalu",
    applicantCount: 8,
    deadline: "20 November 2026",
    applyUrl: "https://forms.gle/pabe-recruitment",
    overview:
      "Mengawasi jalannya kurikulum tahfidz Al-Qur'an, pembinaan adab santri mukim, dan memfasilitasi kebutuhan pendampingan asatidz di rumah tahfidz naungan yayasan.",
    responsibilities: [
      "Menyusun dan mengevaluasi target hafalan santri binaan secara terstruktur dan bertahap",
      "Mengkoordinir jadwal pengajaran asatidz dan pendampingan tahsin harian santri",
      "Memantau perkembangan karakter, kesehatan, dan kesejahteraan santri yatim dhuafa mukim",
      "Menyelenggarakan kegiatan tasmi', wisuda tahfidz berkala, dan kajian bulanan wali santri",
      "Menyusun laporan perkembangan santri untuk disampaikan kepada para donatur orang tua asuh",
    ],
    requirements: [
      "Memiliki hafalan Al-Qur'an mutqin (minimal 5 juz, diutamakan 30 juz)",
      "Pendidikan S1 Pendidikan Agama Islam, Ilmu Al-Qur'an & Tafsir, atau alumni pesantren",
      "Memiliki pengalaman mengajar tahfidz anak-anak dan remaja minimal 2 tahun",
      "Memiliki jiwa kepemimpinan, penyabar, dan mencintai dunia pendidikan anak",
      "Memahami metode pembelajaran Al-Qur'an terkini (Tahsin bersanad adalah nilai plus)",
    ],
    benefits: [
      "Gaji bulanan dan tunjangan pengasuhan santri",
      "Fasilitas tempat tinggal / mess pengajar di lingkungan asri yayasan",
      "Lingkungan pengabdian Qur'ani yang tenang dan penuh berkah",
      "Dukungan pengembangan sanad tahsin dan kelanjutan studi keagamaan",
    ],
  },
];
