import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startRoutineTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    allowClose: true,
    overlayColor: "rgba(15, 23, 42, 0.65)",
    stagePadding: 8,
    stageRadius: 6,
    popoverOffset: 16,
    popoverClass: "pabe-driver-popover",
    steps: [
      {
        element: "#tour-donor-identity",
        popover: {
          title: "Data Diri & WhatsApp",
          description: "Masukkan nama dan nomor WhatsApp aktif Anda untuk menerima pesan pengingat jadwal donasi.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-program-picker",
        popover: {
          title: "Pilih Program Donasi",
          description: "Pilih nama program donasi yang ingin Anda dukung secara berkala.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-schedule-frequency",
        popover: {
          title: "Pilihan Jadwal Donasi",
          description: "Tentukan pengulangan waktu: setiap hari, mingguan (pilih hari tertentu), atau bulanan (pilih tanggal).",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-routine-type",
        popover: {
          title: "Model Pelaksanaan",
          description: "Pilih cara kerja donasi: pesan pengingat biasa atau donasi otomatis dengan tautan pembayaran siap bayar.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-schedule-time",
        popover: {
          title: "Jam Pengingat",
          description: "Atur jam dan menit pengiriman pesan ke nomor WhatsApp Anda (format 24 jam).",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-add-program",
        popover: {
          title: "Tambah Program Lain",
          description: "Gunakan tombol ini jika Anda ingin mendaftarkan hingga 2 pilihan program donasi sekaligus.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-summary-card",
        popover: {
          title: "Simpan Jadwal",
          description: "Periksa rincian jadwal Anda, lalu tekan tombol simpan untuk mengaktifkan pengingat.",
          side: "left",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
}
