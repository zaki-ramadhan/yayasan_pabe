import { toast } from "@/hooks/useToast";

/**
 * Utilitas untuk mengonversi elemen SVG QRIS atau URL gambar QRIS ke kanvas berlatar putih
 * dan mengunduhnya sebagai berkas PNG resolusi tinggi secara otomatis.
 *
 * @param {object} params
 * @param {object} params.donation - Objek data donasi yang memuat invoiceId
 * @param {string} [params.effectiveSimulatorUrl] - URL fallback simulator QRIS jika elemen SVG tidak ditemukan
 * @returns {Promise<boolean>}
 */
export async function downloadQrisImage({ donation, effectiveSimulatorUrl = "" }) {
  const fileName = `QRIS-${donation?.invoiceId || "donasi"}.png`;

  try {
    const svg = typeof document !== "undefined" ? document.getElementById("qris-svg-code") : null;

    if (svg) {
      return new Promise((resolve) => {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const URLObj = window.URL || window.webkitURL || window;
        const blobUrl = URLObj.createObjectURL(svgBlob);
        const img = new window.Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const padding = 36;
          const qrSize = 480;
          canvas.width = qrSize + padding * 2;
          canvas.height = qrSize + padding * 2;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URLObj.revokeObjectURL(blobUrl);
            toast.success("Gambar QRIS berhasil diunduh.");
            resolve(true);
          } else {
            URLObj.revokeObjectURL(blobUrl);
            toast.error("Gagal memproses kanvas QRIS.");
            resolve(false);
          }
        };

        img.onerror = () => {
          URLObj.revokeObjectURL(blobUrl);
          toast.error("Gagal memproses gambar QRIS.");
          resolve(false);
        };

        img.src = blobUrl;
      });
    }

    if (effectiveSimulatorUrl) {
      const res = await fetch(effectiveSimulatorUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Gambar QRIS berhasil diunduh.");
      return true;
    }

    toast.error("Kode QRIS tidak tersedia untuk diunduh.");
    return false;
  } catch {
    if (effectiveSimulatorUrl) {
      window.open(effectiveSimulatorUrl, "_blank");
      toast.info("Gambar QRIS dibuka di tab baru untuk disimpan.");
      return true;
    }
    toast.error("Gagal mengunduh gambar QRIS.");
    return false;
  }
}

