/**
 * Helper utilitas pemrosesan video di sisi peramban (Browser-side Video Processing).
 * Menangani ekstraksi metadata, pemulihan durasi bug Chromium (WhatsApp fMP4),
 * dan pembuatan poster foto statis via Canvas untuk pratinjau sebelum unggah.
 */

/**
 * Format durasi video menjadi format menit:detik ramah pengguna.
 * Mengembalikan null jika durasi tidak valid atau bernilai 0 (mencegah bug "0:00").
 *
 * @param {number} seconds - Durasi dalam detik
 * @returns {string|null} Format "m:ss" (contoh: "1:05") atau null
 */
export function formatVideoDuration(seconds) {
  if (typeof seconds !== "number" || !isFinite(seconds) || isNaN(seconds) || seconds <= 0) {
    return null;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Ekstraksi metadata video (durasi aktual) dan pembuatan gambar pratinjau foto statis dari frame video.
 *
 * Solusi untuk 3 kendala utama:
 * 1. Foto Statis Nyata: Menggambar frame video ke Canvas untuk menghasilkan thumbnail DataURL statis murni (bukan video berputar).
 * 2. Chromium GPU Buffer Activation: Memicu pemutaran 1 frame lalu langsung di-pause untuk mengaktifkan buffer GPU frame.
 * 3. Chromium Infinity/0 Duration Bug: Pancingan seeking ke ujung stream untuk video WhatsApp fMP4.
 *
 * @param {File|Blob} file - Berkas video
 * @returns {Promise<{
 *   duration: number,
 *   durationFormatted: string|null,
 *   thumbnailUrl: string|null,
 *   isSupported: boolean
 * }>}
 */
export function extractVideoMetadata(file) {
  return new Promise((resolve) => {
    if (!file || typeof window === "undefined" || typeof document === "undefined") {
      return resolve({
        duration: 0,
        durationFormatted: null,
        thumbnailUrl: null,
        isSupported: false,
      });
    }

    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      return resolve({
        duration: 0,
        durationFormatted: null,
        thumbnailUrl: null,
        isSupported: false,
      });
    }

    const video = document.createElement("video");
    let isSettled = false;
    let capturedThumbnail = null;

    // Pasang sementara ke DOM secara tersembunyi agar Chromium mengaktifkan decoder hardware
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.top = "-9999px";
    video.style.width = "160px";
    video.style.height = "90px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.autoplay = false;

    try {
      document.body.appendChild(video);
    } catch {
      // Abaikan jika tidak dapat append
    }

    const finish = (result) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutTimer);

      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Abaikan pembersihan jika sudah dilepas
      }

      resolve(result);
    };

    // Timeout pengaman 3000ms agar proses validasi UI tidak pernah macet
    const timeoutTimer = setTimeout(() => {
      let dur = video.duration;
      if (!isFinite(dur) || isNaN(dur) || dur <= 0) dur = 0;
      finish({
        duration: dur,
        durationFormatted: formatVideoDuration(dur),
        thumbnailUrl: capturedThumbnail,
        isSupported: Boolean(capturedThumbnail || dur > 0),
      });
    }, 3000);

    // Tangkap frame saat ini ke Canvas 2D menjadi foto statis
    const captureThumbnail = () => {
      try {
        const vw = video.videoWidth || 0;
        const vh = video.videoHeight || 0;
        if (vw > 0 && vh > 0) {
          const canvas = document.createElement("canvas");
          const maxDim = 320;
          const scale = Math.min(1, maxDim / Math.max(vw, vh));
          canvas.width = Math.max(1, Math.round(vw * scale));
          canvas.height = Math.max(1, Math.round(vh * scale));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            if (dataUrl && dataUrl.length > 200) {
              capturedThumbnail = dataUrl;
              return true;
            }
          }
        }
      } catch {
        // Fallback jika canvas terhalang security policy
      }
      return false;
    };

    const processCompletion = () => {
      let finalDuration = video.duration;
      if (!isFinite(finalDuration) || isNaN(finalDuration) || finalDuration <= 0) {
        finalDuration = 0;
      }

      // Ambil frame terbaik yang tersedia sebagai foto statis
      captureThumbnail();

      finish({
        duration: finalDuration,
        durationFormatted: formatVideoDuration(finalDuration),
        thumbnailUrl: capturedThumbnail,
        isSupported: true,
      });
    };

    // Ketika frame pertama (loadeddata) sudah didecode oleh peramban
    video.onloadeddata = () => {
      // Pancing 1 frame agar GPU texture terisi, lalu langsung pause agar foto statis
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          video.pause();
          try {
            video.currentTime = Math.min(0.2, (video.duration || 1) / 3);
          } catch {}
          setTimeout(() => {
            processCompletion();
          }, 50);
        }).catch(() => {
          processCompletion();
        });
      } else {
        processCompletion();
      }
    };

    video.onloadedmetadata = () => {
      // Jika durasi terbaca Infinity atau 0 (khas WhatsApp / fMP4), pancing kalkulasi durasi demuxer
      if (!isFinite(video.duration) || video.duration === 0) {
        const onSeekEnd = () => {
          video.removeEventListener("seeked", onSeekEnd);
          try {
            video.currentTime = 0.1;
          } catch {
            processCompletion();
          }
        };
        video.addEventListener("seeked", onSeekEnd, { once: true });
        try {
          video.currentTime = 1e9;
        } catch {
          // Lanjut ke onloadeddata
        }
      }
    };

    video.onerror = () => {
      // Codec tidak dapat didecode peramban lokal (contoh HEVC/H.265 di Windows tanpa codec pack)
      finish({
        duration: 0,
        durationFormatted: null,
        thumbnailUrl: null,
        isSupported: false,
      });
    };

    video.src = objectUrl;
  });
}
