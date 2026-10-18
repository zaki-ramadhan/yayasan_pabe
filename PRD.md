# PRD & Technical Specification: Platform Filantropi Digital
## Yayasan PABE

Dokumen ini merupakan panduan spesifikasi produk, arsitektur teknis, dan cetak biru implementasi (*single source of truth*) untuk membangun platform filantropi dan crowdfunding digital Yayasan PABE (mengadopsi seluruh fitur, alur kerja, dan keunggulan beqicharity.com ke dalam arsitektur modern Next.js).

---

## 1. Project Overview & Brand Identity

### 1.1 Entitas & Misi
- **Nama Lembaga:** Yayasan PABE.
- **Fokus Gerakan:** Pendidikan & Dakwah Al-Qur'an, Kemandirian Santri/Yatim, Zakat-Infak-Sedekah-Wakaf (ZISWAF), Tanggap Bencana & Pemberdayaan Ekonomi Umat.
- **Visi Digital:** Membangun platform filantropi modern berbasis web yang transparan, akuntabel, mobile-friendly, dan memiliki konversi donasi tinggi.
- **Bahasa & Internasionalisasi:**
  - Bahasa Indonesia (ID - Bahasa Utama)
  - English (EN)
  - Arabic (AR - Siap tata letak Right-to-Left / RTL)
  - Mata Uang: Rupiah (IDR), format penulisan baku: `Rp 1.000.000`.

### 1.2 Design System & Token Warna
- **Primary Color:** Ocean Sky Blue (`#0ea5e9` s.d. `#0284c7`) — ketenangan, integritas, dan transparansi.
- **Accent / Success:** Emerald Green (`#10b981`) — indikator dana terkumpul, transaksi terbayar, dan tombol positif.
- **Urgent / Warning:** Warm Coral / Amber (`#f59e0b` & `#ef4444`) — badge program darurat bencana / batas waktu kritis.
- **Surface & Backgrounds:**
  - Light mode: Slate Light (`#f8fafc`), Pure Card (`#ffffff`), Muted Border (`#e2e8f0`).
  - Text & Contrast: Deep Slate (`#0f172a`), Muted Body (`#475569`), WAI-ARIA AA standard.
- **Anti-Gimmick Directives:**
  - Tanpa radial glow orbs, dot grids generator, atau gradasi neon ungu-hitam generic AI.
  - Border radius proporsional (`rounded-lg` atau `rounded-xl`, hindari spam `rounded-full` berlebihan).
  - Terapkan layout *workflow-first* khas aplikasi donasi profesional.

---

## 2. Arsitektur Codebase & Struktur Direktori

Mengikuti standar Senior Flat-First, kedalaman maksimal 3-4 tingkat, pemisahan tanggung jawab (Separation of Concerns), dan bebas redundansi penamaan (*no stuttering*).

```
yayasan_generasi_sejahtera_mandiri/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.js                          # Beranda / Landing page
│   │   │   ├── tentang-kami/page.js             # Profil yayasan, visi misi, legalitas
│   │   │   ├── program/page.js                  # Katalog seluruh campaign & filter kategori
│   │   │   ├── campaign/[slug]/
│   │   │   │   ├── page.js                      # Detail campaign & update penyaluran
│   │   │   │   └── donate/page.js               # Form checkout donasi single-page
│   │   │   ├── invoice/[id]/page.js             # Halaman instruksi bayar, VA & QRIS
│   │   │   ├── donasi-rutin/page.js             # Form pendaftaran sedekah terjadwal
│   │   │   ├── kalkulator-zakat/page.js         # Kalkulator 5-in-1 ZISWAF interaktif
│   │   │   ├── laporan/page.js                  # Laporan audit KAP & dokumen transparansi
│   │   │   ├── artikel/
│   │   │   │   ├── page.js                      # Indeks berita & edukasi
│   │   │   │   └── [slug]/page.js               # Baca artikel
│   │   │   ├── volunteer/page.js                # Registrasi relawan aksi
│   │   │   ├── karier/page.js                   # Lowongan kerja yayasan
│   │   │   └── ketentuan-transaksi/page.js      # Legal & limitasi transaksi
│   │   ├── (admin)/
│   │   │   └── dashboard/
│   │   │       ├── page.js                      # Ringkasan metrik donasi & grafik
│   │   │       ├── campaigns/page.js            # CRUD program & update penyaluran
│   │   │       ├── donations/page.js            # Rekonsiliasi transaksi & ekspor CSV
│   │   │       ├── recurring/page.js            # Manajemen donatur rutin & WhatsApp log
│   │   │       └── settings/page.js             # Update harga emas & konfigurasi API
│   │   ├── api/
│   │   │   ├── payments/
│   │   │   │   ├── create/route.js              # Inisiasi pembayaran ke gateway
│   │   │   │   └── webhook/route.js             # Callback webhook (Midtrans/TriPay)
│   │   │   ├── recurring/trigger/route.js       # Cron endpoint pengiriman pesan WA
│   │   │   └── zakat-rates/route.js             # Fetch harga emas terkini
│   │   ├── layout.js                            # Root layout, font, metadata
│   │   └── globals.css                          # Tailwind CSS v4 setup
│   ├── components/
│   │   ├── shared/                              # Header, Footer, MobileNav, LangSwitcher
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MobileNavigation.jsx
│   │   │   └── LanguageSwitcher.jsx
│   │   ├── campaign/                            # Komponen khusus halaman campaign
│   │   │   ├── CampaignCard.jsx
│   │   │   ├── CampaignProgress.jsx
│   │   │   ├── DonorList.jsx
│   │   │   └── DistributionUpdates.jsx
│   │   ├── donation/                            # Komponen formulir transaksi
│   │   │   ├── NominalSelector.jsx
│   │   │   ├── PaymentMethodPicker.jsx
│   │   │   └── InvoiceSummary.jsx
│   │   ├── zakat/                               # Komponen kalkulator zakat
│   │   │   ├── ZakatTabs.jsx
│   │   │   ├── ZakatIncomeForm.jsx
│   │   │   ├── ZakatMaalForm.jsx
│   │   │   ├── ZakatGoldForm.jsx
│   │   │   └── ZakatResultCard.jsx
│   │   └── ui/                                  # Primitif UI (Modal, Button, Accordion)
│   │       ├── ModalDialog.jsx
│   │       ├── Accordion.jsx
│   │       └── SkeletonLoader.jsx
│   ├── lib/
│   │   ├── db.js                                # Koneksi database (Prisma / Drizzle)
│   │   ├── paymentGateway.js                    # Adaptor Midtrans / TriPay
│   │   ├── whatsappGateway.js                   # Client pengiriman pesan WhatsApp (Fonnte)
│   │   ├── constants.js                         # Enums status transaksi, kategori program
│   │   └── utils.js                             # Format rupiah, tanggal, sanitasi input
│   └── types/                                   # TypeScript / JSDoc Type Definitions
```

---

## 3. Spesifikasi Fitur Detail & Alur Halaman

### 3.1 Beranda (Home Page)
1. **Hero Slider Prioritas:** Banner carousel program tanggap darurat (Gempa, Bencana, Santri Yatim) dengan tombol CTA *Donasi Sekarang*.
2. **Live Counter Dampak:** Statistik live yang dihitung dari database (`Total Donasi Terkumpul`, `Penerima Manfaat`, `Jumlah Donatur`).
3. **Kategori Cepat:** Card icon 8 pilar: *Donasi Rutin, ZIS, Santri, Infrastruktur, Pangan & Air, Pemberdayaan, Kemanusiaan, Bencana Alam*.
4. **Grid Program Pilihan:**
   - Thumbnail 16:9, badge kategori, judul program (maksimal 2 baris truncate).
   - Penyelenggara: *Yayasan PABE* (verified checkmark).
   - Progress bar capaian target (`Rp terkumpul` vs `Target` atau status open-ended).
   - Avatar stack donatur + counter jumlah donatur (`150+ donatur`).
   - Tombol CTA card: *Donasi Sekarang*.
5. **Feed Dokumentasi & Penyaluran:**
   - Tab filter kategori: *Semua, Kemanusiaan, Literasi Keuangan, Sosial, Opini*.
   - Kartu artikel rilis bantuan dengan foto lapangan dan tanggal terbit.
6. **Pop-up Modal Tanggap Darurat:**
   - Pop-up otomatis pada kunjungan pertama untuk program bencana mendesak.
   - Fitur *Jangan Tampilkan Lagi* tersimpan pada `localStorage` / cookies selama 7 hari.

---

### 3.2 Halaman Detail Campaign (`/campaign/[slug]`)
1. **Header & Galeri Foto:** Foto headline resolusi tinggi + foto dokumentasi pendukung.
2. **Card Finansial:**
   - Nominal terkumpul, target dana, persentase progress bar.
   - Jumlah donatur dan status sisa hari.
   - Tombol share interaktif: WhatsApp (pre-filled message), Facebook, X, Telegram, dan Salin Link.
3. **Navigasi 3 Tab Konten:**
   - **Tab Keterangan:** Kronologi kebutuhan, target penyaluran, dasar hukum syariat, rekening resmi.
   - **Tab Kabar Terbaru:** Timeline kabar penyaluran dari relawan lapangan (disertai tanggal, foto dokumentasi serah terima, dan rincian dana tersalurkan).
   - **Tab Donatur:** Daftar seluruh donatur terverifikasi, nominal donasi, timestamp waktu, status anonim (*Hamba Allah*), dan doa/pesan donatur.
4. **Fundraiser / Relawan Kebaikan (MyBesti):**
   - Menampilkan daftar fundraiser aktif untuk campaign terkait.
   - Tombol *Gabung Fundraiser* untuk membuat link referral pribadi (`?ref=kode`).
5. **Sticky Bottom Action Bar (Mobile & Desktop):**
   - Bar mengambang di bawah layar: tombol *Donasi Sekarang* + tombol chat cepat ke WhatsApp CS resmi yayasan.

---

### 3.3 Alur Transaksi Single-Page Checkout (`/campaign/[slug]/donate`)
Alur transaksi 4 langkah pada satu layar tanpa redirect berulang:
1. **Langkah 1 - Pemilihan Nominal:**
   - Tombol nominal instan: `Rp 10.000`, `Rp 25.000`, `Rp 50.000`, `Rp 100.000`, `Rp 250.000`, `Rp 500.000`.
   - Input custom nominal (validasi minimum `Rp 1.000` untuk QRIS, `Rp 10.000` untuk Virtual Account).
2. **Langkah 2 - Identitas Donatur:**
   - Sapaan: *Bapak / Ibu / Saudara*.
   - Nama Lengkap + Checkbox: `Sembunyikan nama saya (Donasi Anonim / Hamba Allah)`.
   - Email (untuk bukti potong zakat / kwitansi resmi).
   - Nomor WhatsApp / Handphone (wajib validasi nomor Indonesia `08...` atau `628...`).
   - Doa / Pesan Dukungan (Textarea opsional, maksimal 250 karakter).
3. **Langkah 3 - Pilihan Channel Pembayaran:**
   - **Virtual Account Otomatis:** Bank Syariah Indonesia (BSI), Mandiri, BRI, BNI, Permata, CIMB.
   - **QRIS & E-Wallet:** QRIS Real-time (BCA, GoPay, OVO, ShopeePay, DANA, LinkAja).
   - **Transfer Bank Manual:** Rekening resmi Yayasan PABE dengan kode unik 3 digit verifikasi otomatis.
4. **Langkah 4 - Keamanan & Submit:**
   - Cloudflare Turnstile bot verification (ringan, tanpa captcha membingungkan).
   - Tombol submit: `Lanjut Pembayaran` dengan animasi state loading & pencegahan double-click.

---

### 3.4 Halaman Invoice & Instruksi Bayar (`/invoice/[id]`)
1. **Status Pembayaran:** Badge status dinamis (`Menunggu Pembayaran`, `Berhasil Terverifikasi`, `Kedaluwarsa`).
2. **Countdown Timer:** Waktu mundur 24 jam sebelum invoice kedaluwarsa.
3. **Detail Tagihan:**
   - Nomor Virtual Account / Kode QRIS dinamis beresolusi tajam.
   - Tombol *Salin Nomor VA* dan *Salin Nominal* (termasuk kode unik jika transfer manual).
4. **Accordion Panduan Pembayaran:** Petunjuk langkah demi langkah via ATM, Mobile Banking, dan Internet Banking sesuai bank yang dipilih.
5. **Real-time Status Polling:** Halaman otomatis beralih ke status *Berhasil* saat webhook gateway diterima tanpa perlu refresh manual.
6. **Notifikasi Otomatis:** Sistem langsung menembakkan pesan tanda terima invoice ke WhatsApp donatur.

---

### 3.5 Halaman Kalkulator Zakat 5-in-1 (`/kalkulator-zakat`)
Alat hitung kewajiban zakat sesuai fatwa BAZNAS dan MUI:
1. **Zakat Penghasilan:**
   - `Kewajiban = (Penghasilan Bulanan + Penghasilan Tambahan - Cicilan/Hutang Pokok) x 2.5%`.
   - Syarat nisab: Pendapatan pertahun setara 85 gram emas.
2. **Zakat Maal (Harta Simpanan/Tabungan):**
   - `Kewajiban = (Saldo Rekening + Deposito + Investasi Cair - Hutang Jatuh Tempo) x 2.5%` jika kepemilikan telah genap 1 haul (tahun).
3. **Zakat Perusahaan:**
   - `Kewajiban = (Aset Lancar Perusahaan - Hutang Lancar Jangka Pendek) x 2.5%`.
4. **Zakat Perdagangan:**
   - `Kewajiban = (Nilai Stok Dagang + Kas Usaha + Piutang Lancar - Hutang Usaha Tempo) x 2.5%`.
5. **Zakat Emas & Logam Mulia:**
   - Input: Berat emas (gram), nisab 85 gram, harga emas terkini per gram.
   - `Kewajiban = Berat Emas x Harga Emas x 2.5%` jika >= 85 gram.
6. **Card Ringkasan Realtime:**
   - Total harta objek zakat, indikator nisab (*Wajib Zakat* vs *Belum Wajib*), dan estimasi besaran zakat.
   - Tombol: `Tunaikan Zakat Sekarang` (meneruskan nominal dan kategori Zakat langsung ke formulir checkout).

---

### 3.6 Modul Donasi Rutin (`/donasi-rutin`)
1. **Formulir Pendaftaran Rutin:**
   - Pilihan Program: *Sedekah Subuh, Santri Penghafal Qur'an, Pangan Dhuafa, Zakat Maal Rutin*.
   - Pilihan Frekuensi: *Harian, Mingguan (Setiap Hari Jumat), Bulanan (Tanggal tertentu)*.
   - Waktu Pengingat WhatsApp: *Subuh (05:00 WIB), Pagi (08:00 WIB), Siang (12:00 WIB)*.
   - Data Donatur: Nama lengkap dan Nomor WhatsApp aktif.
2. **Mekanisme Otomasi:**
   - Data tersimpan pada tabel `recurring_schedules`.
   - Cron job terjadwal membaca jadwal aktif dan mengirim pesan WhatsApp berisikan teks motivasi dakwah + tautan sekali-klik untuk menyelesaikan pembayaran.

---

### 3.7 Halaman Transparansi, Laporan & Regulasi (`/laporan`)
1. **Laporan Audit Keuangan (Public Expose):**
   - Download PDF Laporan Tahunan hasil audit Kantor Akuntan Publik (KAP).
2. **Surat Keputusan (SK) & Legalitas:**
   - File SK Dewan Pengawas Syariah (DPS).
   - Tanda Daftar Yayasan & Izin Pengumpulan Uang dan Barang (PUB).
3. **Distribusi Penyaluran Dana:**
   - Grafik rekapitulasi dana tersalurkan per pilar program.

---

### 3.8 Komunitas Relawan & Fundraiser (`/volunteer`)
1. **Halaman Volunteer:**
   - Formulir pendaftaran relawan kemanusiaan dan mitigasi bencana.
2. **Program MyBesti (Fundraiser Affiliate):**
   - Pembuatan kode rujukan relawan untuk membagikan tautan program ke komunitas luas.
   - Halaman kode etik dan dashboard pencapaian donasi yang terkumpul melalui link tersebut.

---

## 4. Skema Database & Relasi Entitas (PostgreSQL / MySQL)

```sql
-- 1. Tabel Pengguna (Admin, Petugas, Fundraiser)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'donor', -- 'admin', 'staff', 'fundraiser', 'donor'
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kategori Program
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Campaign
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description VARCHAR(500),
    story_content TEXT NOT NULL,
    target_amount NUMERIC(15, 2) DEFAULT 0,
    collected_amount NUMERIC(15, 2) DEFAULT 0,
    donor_count INTEGER DEFAULT 0,
    is_unlimited BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'completed', 'suspended'
    thumbnail_url VARCHAR(500),
    banner_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);

-- 4. Kabar Penyaluran Campaign
CREATE TABLE campaign_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    disbursed_amount NUMERIC(15, 2) DEFAULT 0,
    photos_json JSONB DEFAULT '[]',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_campaign_updates_campaign ON campaign_updates(campaign_id);

-- 5. Transaksi Donasi
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    fundraiser_id UUID REFERENCES users(id) ON DELETE SET NULL,
    donor_salutation VARCHAR(20), -- 'Bapak', 'Ibu', 'Sdr'
    donor_name VARCHAR(150) NOT NULL,
    donor_email VARCHAR(150),
    donor_phone VARCHAR(50) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    amount NUMERIC(15, 2) NOT NULL,
    unique_code INTEGER DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    donor_prayer TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);

-- 6. Detail Transaksi Payment Gateway
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    gateway_name VARCHAR(50) NOT NULL, -- 'tripay', 'midtrans', 'manual'
    payment_method VARCHAR(50) NOT NULL, -- 'bsi_va', 'mandiri_va', 'qris', 'bank_transfer'
    reference_id VARCHAR(100) UNIQUE,
    va_number VARCHAR(100),
    qr_code_url TEXT,
    fee_amount NUMERIC(12, 2) DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payload_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Donasi Rutin (Scheduled Reminders)
CREATE TABLE recurring_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name VARCHAR(150) NOT NULL,
    donor_phone VARCHAR(50) NOT NULL,
    program_category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'friday', 'monthly'
    reminder_time TIME NOT NULL DEFAULT '05:00:00',
    is_active BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Pengaturan Harga Zakat & Kurs Emas
CREATE TABLE zakat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gold_price_per_gram NUMERIC(15, 2) NOT NULL,
    silver_price_per_gram NUMERIC(15, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Integrasi Pihak Ketiga & Keamanan (Security Hardening)

1. **Payment Gateway (TriPay / Midtrans):**
   - Menggunakan webhook berbasis signature cryptographic (`HMAC-SHA256`) untuk mencegah manipulasi data status pembayaran.
   - Wajib menerapkan **Idempotency Key**: Pembayaran yang telah berstatus `paid` dilarang memicu mutasi ganda pada counter campaign.
   - Transaksi database dibungkus dalam blok atomik (`BEGIN TRANSACTION` ... `COMMIT`).
2. **WhatsApp Gateway (Fonnte / WABA API):**
   - Format pesan notifikasi invoice: Menampilkan sapaan donatur, nominal donasi, nomor VA / QRIS link, dan waktu jatuh tempo.
   - Format pesan terima kasih: Pengiriman bukti donasi resmi dan link melihat doa di halaman campaign.
   - Rate limiting pengiriman pesan WhatsApp untuk menghindari pemblokiran nomor pengirim.
3. **Bot & Fraud Protection:**
   - Integrasi Cloudflare Turnstile pada endpoint `/api/payments/create` untuk mencegah spam pembuatan invoice palsu.
4. **Secret Hygiene:**
   - Semua secret key (`TRIPAY_API_KEY`, `MIDTRANS_SERVER_KEY`, `FONNTE_TOKEN`, `DATABASE_URL`) wajib dibaca via environment variables (`.env.local`), dilarang di-hardcode.

---

## 6. Back-Office Admin Dashboard

Modul pada `src/app/(admin)/dashboard/`:
1. **Ringkasan Finansial:** Kartu metrik total dana terhimpun hari ini, minggu ini, dan total sepanjang masa, lengkap dengan grafik perolehan.
2. **Manajemen Program:** Antarmuka pembuatan dan pengeditan campaign, pengaturan status darurat, dan publikasi kabar penyaluran lengkap dengan unggah gambar dokumentasi.
3. **Rekonsiliasi Transaksi:** Tabel pemantauan status transaksi real-time, filter berdasarkan metode bayar dan status, tombol verifikasi manual bagi transfer rekening, serta fitur ekspor rekapitulasi transaksi ke format Excel/CSV.
4. **Monitoring Donasi Rutin:** Daftar jadwal aktif donatur rutin dan histori pengiriman pesan WhatsApp.
5. **Konfigurasi Syariah:** Form pembaruan acuan harga emas per gram untuk menjaga akurasi kalkulator zakat.

---

## 7. Roadmap Pengerjaan & Panduan Prompting Bertahap

Untuk mengerjakan proyek ini dengan AI, jalankan instruksi secara bertahap mengikuti urutan berikut:

### Tahap 1: Setup Basis Desain, Tema & Layout Utama
> *Buatkan komponen layout utama untuk Yayasan PABE menggunakan Tailwind CSS v4 di Next.js App Router. Buat Navbar responsif dengan logo, menu Program (dropdown), Artikel, Informasi, tombol ganti bahasa (ID/EN/AR), tombol CTA Donasi Sekarang, serta Mobile Bottom Navigation (Home, Artikel, Donasi, Rutin, Login). Gunakan token warna Ocean Blue (#0ea5e9, #0284c7) dan Slate (#0f172a).*

### Tahap 2: Halaman Beranda (Landing Page)
> *Implementasikan halaman beranda (src/app/(public)/page.js) dengan komponen Hero Banner Carousel program darurat, Live Counter metrik dampak donasi, Grid Icon 8 Kategori Program, Grid Campaign Card crowdfunding dengan progress bar dan jumlah donatur, Feed Penyaluran Berita dengan filter tab, serta Popup Modal Tanggap Darurat.*

### Tahap 3: Halaman Detail Campaign
> *Buatkan halaman single campaign (src/app/(public)/campaign/[slug]/page.js). Tampilkan galeri banner program, progress capaian dana, ringkasan target, tombol share ke WhatsApp dan media sosial, 3 tab navigasi interaktif (Keterangan, Kabar Terbaru Penyaluran dengan foto, dan Daftar Donatur dengan doa), serta Sticky CTA Bar di bagian bawah layar.*

### Tahap 4: Alur Checkout Donasi Single-Page & Payment Gateway
> *Bangun halaman checkout donasi (src/app/(public)/campaign/[slug]/donate/page.js) dan API route inisiasi pembayaran (src/app/api/payments/create/route.js). Sediakan pemilihan nominal cepat (pills), input custom, form identitas donatur dengan opsi anonim (Hamba Allah), input doa, pilihan metode pembayaran (Virtual Account, QRIS, Transfer Bank), validasi Zod ketat, dan integrasi webhook payment gateway yang idempoten.*

### Tahap 5: Halaman Invoice & Panduan Pembayaran
> *Buatkan halaman instruksi pembayaran (src/app/(public)/invoice/[id]/page.js). Sediakan countdown timer kedaluwarsa 24 jam, tampilan nomor Virtual Account dan QR Code QRIS dinamis dengan tombol salin otomatis, accordion panduan bayar (ATM, M-Banking, Internet Banking), serta integrasi pengiriman pesan bukti tagihan ke WhatsApp donatur.*

### Tahap 6: Kalkulator Zakat 5-in-1
> *Implementasikan halaman Kalkulator Zakat (src/app/(public)/kalkulator-zakat/page.js) dengan 5 tab: Zakat Penghasilan, Zakat Maal, Zakat Perusahaan, Zakat Perdagangan, dan Zakat Emas. Hitung nilai nisab secara real-time dan sediakan tombol 'Tunaikan Zakat Sekarang' yang langsung mem-passing nilai hasil hitungan ke checkout donasi.*

### Tahap 7: Modul Donasi Rutin & WhatsApp Scheduler
> *Bangun halaman pendaftaran Donasi Rutin (src/app/(public)/donasi-rutin/page.js) dengan pilihan program, nominal, dan frekuensi (Harian/Jumat/Bulanan). Buat API endpoint penjadwalan (src/app/api/recurring/trigger/route.js) untuk mengirimkan pesan WhatsApp pengingat sedekah dan link bayar instan.*

### Tahap 8: Dashboard Admin & Transparansi Laporan
> *Buatkan dashboard admin (src/app/(admin)/dashboard/) untuk mengelola campaign, mempublikasikan kabar penyaluran, merekonsiliasi transaksi donasi, mengekspor laporan ke Excel/CSV, serta halaman publik laporan audit keuangan (src/app/(public)/laporan/page.js).*
