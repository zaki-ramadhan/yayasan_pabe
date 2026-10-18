import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function activateTab(tabValue) {
  document
    .querySelector(`[role="tab"][data-tour-tab="${tabValue}"]`)
    ?.click();
}

/**
 * @param {boolean} hasDonations
 */
export function startCampaignDetailTour(hasDonations = false) {
  const steps = [
    {
      element: "#tour-campaign-header",
      popover: {
        title: "Info Program",
        description: "Nama, kategori, lokasi, dan ringkasan program donasi.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "[data-tour-tab='detail']",
      popover: {
        title: "Detail Program",
        description: "Cerita lengkap dan tujuan program ada di sini.",
        side: "bottom",
        align: "start",
      },
      onHighlightStarted: () => activateTab("detail"),
    },
    {
      element: "[data-tour-tab='penyaluran']",
      popover: {
        title: "Laporan Penyaluran",
        description: "Bukti & foto kegiatan dari dana yang sudah disalurkan.",
        side: "bottom",
        align: "start",
      },
      onHighlightStarted: () => activateTab("penyaluran"),
    },
    {
      element: "[data-tour-tab='doa']",
      popover: {
        title: "Doa & Dukungan",
        description: "Pesan doa dari para donatur yang bisa kamu aminkan.",
        side: "bottom",
        align: "start",
      },
      onHighlightStarted: () => activateTab("doa"),
    },
    {
      element: "#tour-sidebar-donate",
      popover: {
        title: "Progres Dana",
        description: "Dana terkumpul, target, dan jumlah donatur.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#tour-prayer-input",
      popover: {
        title: "Titip Doa",
        description: "Tulis doamu setelah donasi — muncul di halaman ini untuk diamini bersama.",
        side: "left",
        align: "start",
      },
      onHighlightStarted: () => activateTab("doa"),
    },
  ];

  if (hasDonations) {
    steps.splice(4, 0, {
      element: "[data-tour-tab='riwayat']",
      popover: {
        title: "Riwayat Donasi",
        description: "Grafik dan daftar lengkap transaksi yang sudah masuk.",
        side: "bottom",
        align: "start",
      },
      onHighlightStarted: () => activateTab("riwayat"),
    });
  }

  // Filter out steps whose element doesn't exist in the DOM
  const validSteps = steps.filter(({ element }) => {
    if (!element) return true;
    return Boolean(document.querySelector(element));
  });

  const driverObj = driver({
    showProgress: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    allowClose: true,
    overlayColor: "rgba(15, 23, 42, 0.65)",
    stagePadding: 6,
    stageRadius: 8,
    popoverOffset: 12,
    popoverClass: "pabe-driver-popover",
    onDestroyed: () => activateTab("detail"),
    steps: validSteps,
  });

  driverObj.drive();
}
