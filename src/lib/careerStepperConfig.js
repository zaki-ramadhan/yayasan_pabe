/**
 * SSOT Konfigurasi 3 Tahap Alur Rekrutmen Yayasan
 */
export const CAREER_STEPS = [
  { id: "SUBMITTED", stepNumber: "TAHAP 1", title: "Lamaran Terkirim", desc: "Berkas diterima" },
  { id: "REVIEW", stepNumber: "TAHAP 2", title: "Ditinjau", desc: "Ditinjau pengurus" },
  { id: "DECISION", stepNumber: "TAHAP 3", title: "Keputusan", desc: "Diterima / Ditolak" },
];

/**
 * Menentukan status setiap tahapan berdasarkan status DB (3 Tahapan):
 * PENDING: Baru dikirim, menunggu antrean peninjauan admin
 * REVIEWED: Sedang aktif ditinjau oleh pengurus
 * SHORTLISTED / ACCEPTED: Lolos seleksi
 * REJECTED: Belum sesuai kriteria
 * @param {number} stepIndex - 0, 1, atau 2
 * @param {string} appStatus - Status dari DB
 * @returns {"completed" | "active" | "rejected" | "upcoming" | "skipped"}
 */
export function getStepStatus(stepIndex, appStatus = "PENDING") {
  const norm = String(appStatus || "PENDING").toUpperCase();

  if (norm === "REJECTED") {
    if (stepIndex <= 1) return "completed";
    if (stepIndex === 2) return "rejected";
    return "skipped";
  }

  if (norm === "ACCEPTED" || norm === "SHORTLISTED" || norm === "APPROVED") {
    return "completed";
  }

  // In review
  if (norm === "REVIEWED" || norm === "PENDING") {
    if (stepIndex === 0) return "completed";
    if (stepIndex === 1) return "active";
    return "upcoming";
  }

  if (stepIndex === 0) return "completed";
  return "upcoming";
}

/**
 * Mendapatkan indeks tahapan yang saat ini menjadi fokus utama pelamar
 */
export function getActiveStepIndex(status = "PENDING") {
  const norm = String(status || "PENDING").toUpperCase();
  if (norm === "ACCEPTED" || norm === "SHORTLISTED" || norm === "APPROVED" || norm === "REJECTED") {
    return 2;
  }
  return 1; // PENDING & REVIEWED sama-sama berada di tahap Ditinjau
}

/**
 * Mengembalikan teks label status kontekstual untuk tiap node
 */
export function getStepSubtitle(stepIndex, stepState, appStatus = "PENDING") {
  const norm = String(appStatus || "PENDING").toUpperCase();

  if (stepIndex === 0) {
    return "Selesai";
  }

  if (stepIndex === 1) {
    if (stepState === "completed") return "Selesai";
    if (stepState === "active") return "Ditinjau";
    return "Menunggu";
  }

  if (stepIndex === 2) {
    if (stepState === "completed") return "Diterima";
    if (stepState === "rejected") return "Ditolak";
    return "Menunggu";
  }

  return "";
}
