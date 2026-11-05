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
          title: "Data donatur",
          description: "Masukkan nama dan alamat email aktif Anda untuk menerima invoice QRIS dan laporan resmi donasi.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-program-picker",
        popover: {
          title: "Pilih program donasi",
          description: "Pilih nama program donasi yang ingin Anda dukung secara berkala.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-schedule-frequency",
        popover: {
          title: "Pilihan jadwal donasi",
          description: "Tentukan pengulangan waktu: mingguan (pilih hari tertentu) atau bulanan (pilih tanggal).",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-routine-type",
        popover: {
          title: "Model pelaksanaan",
          description: "Pilih cara kerja donasi: email pengingat biasa atau donasi otomatis dengan tautan invoice QRIS siap bayar.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-schedule-time",
        popover: {
          title: "Jam pengingat",
          description: "Atur jam dan menit pengiriman invoice resmi ke email Anda (format 24 jam).",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-summary-card",
        popover: {
          title: "Simpan jadwal",
          description: "Periksa rincian jadwal Anda, lalu tekan tombol simpan untuk mengaktifkan komitmen donasi rutin.",
          side: "left",
          align: "start",
        },
      },
    ],
  });

  driverObj.drive();
}
