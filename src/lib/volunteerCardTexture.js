import { formatDate } from "@/lib/formatters";
import { formatVolunteerId, formatVolunteerBadgeName } from "@/lib/volunteerUtils";
import { ORG_PROFILE } from "@/data/orgProfile";

// Standarisasi font kartu tanda anggota: Plus Jakarta Sans
const FONT_FAMILY = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

/**
 * Utility penggambaran path rounded rectangle dengan fallback lintas browser
 */
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Menggambar ilustrasi potret relawan studio netral yang memenuhi area foto atas (full-bleed)
 */
function drawFullPortraitAvatar(ctx, x, y, w, h) {
  ctx.save();

  // Latar belakang studio netral gelap elegan
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "#1e293b");
  grad.addColorStop(0.5, "#0f172a");
  grad.addColorStop(1, "#022c22");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  const centerX = x + w / 2;
  const bottomY = y + h;

  // Bahu & Torso memenuhi bagian bawah kotak
  ctx.fillStyle = "#f8fafc"; // Turtleneck putih bersih seperti referensi
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.bezierCurveTo(x + 60, bottomY - 260, centerX - 180, bottomY - 320, centerX, bottomY - 320);
  ctx.bezierCurveTo(centerX + 180, bottomY - 320, x + w - 60, bottomY - 260, x + w, bottomY);
  ctx.closePath();
  ctx.fill();

  // Lipatan kerah turtleneck
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX - 80, bottomY - 280);
  ctx.lineTo(centerX + 80, bottomY - 280);
  ctx.stroke();

  // Leher
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(centerX - 65, bottomY - 400, 130, 90);

  // Kepala
  const headCenterY = bottomY - 520;
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(centerX, headCenterY, 150, 0, Math.PI * 2);
  ctx.fill();

  // Rambut natural rapi
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(centerX, headCenterY - 15, 154, Math.PI * 0.85, Math.PI * 2.15);
  ctx.bezierCurveTo(centerX + 130, headCenterY - 140, centerX - 130, headCenterY - 140, centerX - 150, headCenterY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Menghasilkan dataURL tampak depan KTA Relawan (1024x1440)
 * Mengadopsi arsitektur stepped card (Alexander Betonov style):
 * - Zona Atas: Foto potret full-bleed edge-to-edge
 * - Zona Bawah: Panel warm off-white berundak (asymmetric step-cut)
 * - Teks: Nama relawan font weight medium, peran di kiri bawah, nomor ID di kanan bawah
 */
export function generateVolunteerCardFront({ volunteer, avatarImage } = {}) {
  if (typeof document === "undefined" || !volunteer) return "";

  const width = 1024;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Zona Atas: Foto Potret Relawan (Full-Bleed Edge-to-Edge)
  const photoH = 920;
  ctx.save();
  if (avatarImage) {
    const scale = Math.max(width / avatarImage.width, photoH / avatarImage.height);
    const w = avatarImage.width * scale;
    const h = avatarImage.height * scale;
    ctx.drawImage(avatarImage, (width - w) / 2, 0, w, h);
  } else {
    drawFullPortraitAvatar(ctx, 0, 0, width, photoH);
  }
  ctx.restore();

  // 2. Zona Bawah: Panel Melengkung Organik Sesuai Referensi (Clean White)
  const notchSplitX = 560; // Titik mulai melengkung
  const notchEndX = 760;   // Titik selesai melengkung
  const notchTopY = 760;   // Ketinggian kiri (diselaraskan agar tinggi panel putih ~47% persis 2D)
  const notchLowY = 850;   // Ketinggian kanan

  ctx.save();
  ctx.fillStyle = "#ffffff"; // Putih bersih sesuai referensi
  ctx.beginPath();
  ctx.moveTo(0, notchTopY);
  ctx.lineTo(notchSplitX, notchTopY);
  ctx.bezierCurveTo(630, notchTopY, 680, notchLowY, notchEndX, notchLowY);
  ctx.lineTo(width, notchLowY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Nama Relawan: Biasa (Tanpa Box), Rata Kiri, Semibold, Hitam Pekat
  const badgeName = formatVolunteerBadgeName(volunteer.fullName || "Relawan Kebaikan", 12);

  ctx.textAlign = "left"; // Align rata kiri
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000"; // Hitam pekat murni

  const nameX = 80;
  const nameY = 835;

  if (badgeName.line2) {
    const maxChars = Math.max(badgeName.line1.length, badgeName.line2.length);
    const fontSize = maxChars > 11 ? 74 : maxChars > 9 ? 82 : 88;
    ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`; // Font weight semibold
    const lineSpacing = fontSize * 1.15;
    ctx.fillText(badgeName.line1, nameX, nameY);
    ctx.fillText(badgeName.line2, nameX, nameY + lineSpacing);
  } else {
    const fontSize = badgeName.line1.length > 10 ? 88 : 96;
    ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`;
    ctx.fillText(badgeName.line1, nameX, nameY);
  }

  // 4. Baris Informasi Bawah: Teks Hitam Pekat Minimalis Sesuai Referensi
  const bottomRowY = 1365;
  const regId = volunteer.volunteerId || formatVolunteerId(volunteer.id, volunteer.createdAt);

  // Kiri Bawah: Status Relawan Resmi
  ctx.textAlign = "left";
  ctx.fillStyle = "#000000";
  ctx.font = `600 42px ${FONT_FAMILY}`;
  ctx.fillText("Relawan Kebaikan", 80, bottomRowY);

  // Kanan Bawah: Nomor ID Relawan (Dinaikkan ke 42px)
  ctx.textAlign = "right";
  ctx.fillStyle = "#000000";
  ctx.font = `600 42px ${FONT_FAMILY}`;
  ctx.fillText(`ID ${regId}`, width - 80, bottomRowY);

  return canvas.toDataURL("image/png");
}

/**
 * Menghasilkan dataURL tampak belakang KTA Relawan (1024x1440)
 * Memuat QR Code verifikasi lapangan yang besar & mudah dipindai,
 * logo resmi yayasan, tanggal berlaku, dan legalitas SK Kemenkumham RI
 */
export function generateVolunteerCardBack({ volunteer, qrCanvas, logoImage } = {}) {
  if (typeof document === "undefined" || !volunteer) return "";

  const width = 1024;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Background Matte Deep Slate Elegan
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#1e293b");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Frame Inset Halus
  roundRect(ctx, 40, 40, width - 80, height - 80, 24);
  ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 2. Header Atas: Logo & Nama Yayasan
  const headerY = 130;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (logoImage && logoImage.width && logoImage.height) {
    const scale = 70 / logoImage.height;
    const logoW = logoImage.width * scale;
    ctx.drawImage(logoImage, (width - logoW) / 2, headerY - 35, logoW, 70);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 34px ${FONT_FAMILY}`;
    ctx.fillText(ORG_PROFILE.name.toUpperCase(), width / 2, headerY);
  }

  ctx.fillStyle = "#a7f3d0";
  ctx.font = `600 20px ${FONT_FAMILY}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("KARTU TANDA ANGGOTA RESMI", width / 2, headerY + 65);
  ctx.letterSpacing = "0px";

  // Garis Pembatas Emas
  ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, headerY + 105);
  ctx.lineTo(width - 160, headerY + 105);
  ctx.stroke();

  // 3. Tengah: Kotak QR Code Besar untuk Scan Lapangan
  const qrBoxSize = 380;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 370;

  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (qrCanvas) {
    const pad = 24;
    ctx.drawImage(qrCanvas, qrBoxX + pad, qrBoxY + pad, qrBoxSize - pad * 2, qrBoxSize - pad * 2);
  }

  // Label Pindai di Bawah QR
  ctx.fillStyle = "#fde047";
  ctx.font = `bold 24px ${FONT_FAMILY}`;
  ctx.letterSpacing = "2px";
  ctx.fillText("PINDAI UNTUK VALIDASI KTA", width / 2, qrBoxY + qrBoxSize + 48);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#94a3b8";
  ctx.font = `normal 19px ${FONT_FAMILY}`;
  ctx.fillText("Verifikasi keaslian status penugasan relawan di lapangan", width / 2, qrBoxY + qrBoxSize + 85);

  // 4. Kotak Informasi Tanggal & Masa Berlaku
  const infoBoxY = 920;
  const infoBoxW = width - 160;
  roundRect(ctx, 80, infoBoxY, infoBoxW, 180, 20);
  ctx.fillStyle = "rgba(6, 78, 59, 0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const joinDate = formatDate(volunteer.createdAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const expDate = formatDate(volunteer.validUntil || volunteer.createdAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Kolom Kiri: Tgl Terdaftar
  ctx.textAlign = "left";
  ctx.fillStyle = "#a7f3d0";
  ctx.font = `600 19px ${FONT_FAMILY}`;
  ctx.fillText("TANGGAL TERDAFTAR", 120, infoBoxY + 55);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 26px ${FONT_FAMILY}`;
  ctx.fillText(joinDate, 120, infoBoxY + 105);

  // Kolom Kanan: Masa Berlaku
  ctx.textAlign = "right";
  ctx.fillStyle = "#fde047";
  ctx.font = `600 19px ${FONT_FAMILY}`;
  ctx.fillText("MASA BERLAKU HINGGA", width - 120, infoBoxY + 55);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 26px ${FONT_FAMILY}`;
  ctx.fillText(expDate, width - 120, infoBoxY + 105);

  // 5. Footer Legalitas
  const footerY = 1240;
  ctx.textAlign = "center";
  ctx.fillStyle = "#cbd5e1";
  ctx.font = `normal 20px ${FONT_FAMILY}`;
  ctx.fillText(`Lembaga Kesejahteraan Sosial: ${ORG_PROFILE.name}`, width / 2, footerY);
  ctx.fillStyle = "#94a3b8";
  ctx.font = `normal 18px ${FONT_FAMILY}`;
  ctx.fillText(`SK Kemenkumham RI: ${ORG_PROFILE.legal.skKemenkumham}`, width / 2, footerY + 36);
  ctx.fillText(`Website: payungberkah.id  |  Hotline: ${ORG_PROFILE.contacts.whatsapp}`, width / 2, footerY + 70);

  return canvas.toDataURL("image/png");
}
