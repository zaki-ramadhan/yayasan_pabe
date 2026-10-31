# Yayasan PABE

Dokumentasi ringkasan proyek platform web donasi, ZISWAF, dan filantropi digital Yayasan PABE.

---

## Tentang Platform

Website ini dibangun untuk memfasilitasi penghimpunan dan pengelolaan dana Zakat, Infak, Sedekah, dan Wakaf (ZISWAF) secara terpusat, transparan, dan akuntabel bagi para donatur dan mustahik.

---

## Cakupan Modul & Fitur

- **Katalog & Program Kebaikan:**
  - Pengelompokan program: Pendidikan & Tahfidz Qur'an, Pemuliaan Yatim & Dhuafa, Pemberdayaan Ekonomi Mustahik, dan Tanggap Darurat Bencana.
  - Halaman detail program lengkap dengan indikator capaian dana, target donasi, dan kabar berkala penyaluran di lapangan.

- **Sistem Donasi & Transaksi:**
  - Form donasi cepat (*Quick Donate*) dan formulir donasi spesifik per program.
  - Dukungan kanal pembayaran modern: QRIS otomatis, Virtual Account (VA), dan Transfer Bank resmi yayasan.
  - Fasilitas titip doa donatur dan opsi donasi anonim (*hamba Allah*).
  - Halaman invoice transaksi otomatis dengan instruksi pembayaran dan hitung mundur batas waktu.
  - Pendaftaran komitmen donasi rutin (harian, mingguan, bulanan).

- **Kalkulator ZISWAF Terpadu:**
  - Simulasi hitung nishab otomatis: Zakat Profesi/Penghasilan, Zakat Maal (Tabungan/Emas), Zakat Perdagangan, Infak, dan Fidyah.

- **Transparansi & Informasi Publik:**
  - Profil legalitas lembaga (SK Kemenkumham, Izin Dinsos, NPWP) dan susunan pengurus yayasan.
  - Dokumentasi penyaluran bantuan langsung (*Distribusi Feed*).
  - Laporan keuangan publik dengan pencatatan transparan dan akuntabel.
  - Publikasi artikel dakwah, berita kegiatan, pendaftaran relawan, dan informasi karier.

---

## Folder Dokumen Privat (Aset Internal)

Dokumen legal, keuangan, dan identitas yayasan yang bersifat privat ditempatkan pada folder root:
- `/private-docs/legal/`: Akta Notaris, SK Kemenkumham, NPWP, Surat Izin Operasional Dinsos.
- `/private-docs/keuangan/`: Rekening koran, laporan audit akuntan publik, berkas PBB/rekening listrik.
- `/private-docs/identitas/`: KTP/KK Dewan Pembina & Pengurus, dokumen KYC Payment Gateway.

*Seluruh isi direktori `/private-docs/` diabaikan oleh `.gitignore` sehingga aman dari commit git.*

---

## Status Pengerjaan

- **Antarmuka & User Flow:** Seluruh halaman publik, katalog program, modul checkout donasi, kalkulator zakat, hingga halaman invoice selesai dibangun dan responsif di semua perangkat.
- **Sistem Pembayaran:** Siap dihubungkan ke akun Midtrans resmi yayasan untuk transaksi live.

---

*Hak Cipta © Yayasan PABE. Repositori ini bersifat privat dan dikembangkan khusus untuk kebutuhan internal yayasan.*
