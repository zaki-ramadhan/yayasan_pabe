/**
 * Meta WhatsApp Cloud API Driver (Official WhatsApp Business Platform).
 * Zero risk of phone banning when using verified Meta templates.
 */
export async function sendMetaCloudWhatsApp({
  to,
  message,
  actionUrl = null,
  templateName = null,
  templateParams = [],
}) {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WA_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "Konfigurasi Meta WhatsApp belum lengkap. Harap isi META_WA_PHONE_NUMBER_ID dan META_WA_ACCESS_TOKEN di .env"
    );
  }

  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  // Payload: gunakan template jika templateName disediakan, fallback ke text message
  let bodyPayload = {};
  if (templateName) {
    bodyPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "id" },
        components: [
          {
            type: "body",
            parameters: templateParams.map((val) => ({ type: "text", text: String(val) })),
          },
        ],
      },
    };
  } else {
    // Standard text message
    bodyPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: Boolean(actionUrl),
        body: message,
      },
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || response.statusText;
    console.error("[Meta WA Error]", data.error || data);
    throw new Error(`Meta Cloud API gagal mengirim pesan: ${errorMsg}`);
  }

  return {
    success: true,
    provider: "META_CLOUD",
    messageId: data.messages?.[0]?.id || `meta_${Date.now()}`,
    status: "SENT",
  };
}
