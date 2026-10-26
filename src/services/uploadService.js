/**
 * Layanan komunikasi klien untuk pengunggahan berkas ke API /api/upload.
 * Memisahkan logika jaringan, pembuatan FormData, dan sanitasi respon dari komponen UI.
 */

/**
 * Mengunggah berkas ke server R2 melalui endpoint /api/upload.
 *
 * @param {{
 *   file: File,
 *   context: string,
 *   identifier?: string
 * }} params
 * @returns {Promise<{
 *   url: string,
 *   key: string,
 *   mimeType: string,
 *   size: number,
 *   originalSize: number,
 *   savingsPercent: number
 * }>}
 */
export async function uploadFileToServer({ file, context, identifier = "" }) {
  if (!file) {
    throw new Error("Berkas tidak boleh kosong.");
  }

  if (!context) {
    throw new Error("Konteks pengunggahan (context) wajib disertakan.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);

  if (identifier && typeof identifier === "string") {
    formData.append("identifier", identifier.trim());
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengunggah berkas ke server.");
  }

  return result.data;
}
