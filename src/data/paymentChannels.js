export const PAYMENT_CHANNELS = [
  {
    id: "qris",
    name: "QRIS (Semua Bank & E-Wallet)",
    type: "QRIS",
    fee: 0,
    instructions: [
      "Buka aplikasi mobile banking atau e-wallet berlogo QRIS pilihan Anda.",
      "Pilih menu 'Scan QR' atau 'Bayar QRIS'.",
      "Arahkan kamera ke kode QR di atas atau unggah lembar QR yang telah diunduh dari galeri ponsel Anda.",
      "Pastikan nama penerima yang muncul adalah YAYASAN PAYUNG BERKAH (NMID: ID1026604741144).",
      "Periksa nama penerima dan nominal donasi yang tertera otomatis pada layar aplikasi Anda.",
      "Konfirmasi pembayaran dan simpan bukti transaksi.",
    ],
  },
  {
    id: "bri_va",
    name: "BRI Virtual Account (BRIVA)",
    type: "VA",
    bankCode: "002",
    accountNumberPrefix: "04240",
    fee: 1000,
    instructions: [
      "Buka aplikasi BRImo > Pembayaran > BRIVA.",
      "Masukkan nomor BRIVA yang tertera pada invoice.",
      "Periksa nama donatur dan nominal pembayaran, lalu konfirmasi.",
    ],
  },
  {
    id: "mandiri_va",
    name: "Mandiri Virtual Account",
    type: "VA",
    bankCode: "008",
    accountNumberPrefix: "16600",
    fee: 1000,
    instructions: [
      "Buka aplikasi Livin' by Mandiri > Bayar > Multipayment.",
      "Pilih penyedia jasa / masukkan kode perusahaan PABE.",
      "Masukkan nomor Virtual Account Anda.",
      "Konfirmasi nominal pembayaran dan masukkan PIN Livin.",
    ],
  },
];
