/**
 * Fonnte WhatsApp Gateway Driver (Third-Party QR Gateway).
 */
export async function sendFonnteWhatsApp({ to, message, actionUrl = null }) {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    throw new Error("Konfigurasi FONNTE_TOKEN belum diisi di file .env");
  }

  const endpoint = "https://api.fonnte.com/send";

  const formData = new URLSearchParams();
  formData.append("target", to);
  formData.append("message", message);
  if (actionUrl) {
    formData.append("url", actionUrl);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    const errorMsg = data.reason || data.message || response.statusText;
    console.error("[Fonnte WA Error]", data);
    throw new Error(`Fonnte Gateway gagal mengirim pesan: ${errorMsg}`);
  }

  return {
    success: true,
    provider: "FONNTE",
    messageId: data.id?.[0] || `fonnte_${Date.now()}`,
    status: data.status ? "SENT" : "FAILED",
  };
}
