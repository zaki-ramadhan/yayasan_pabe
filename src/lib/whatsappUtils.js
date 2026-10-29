import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Normalizes an Indonesian phone number to international WhatsApp format (628xxx).
 * Strips non-digits, converts leading '0' or '8' to '628', and validates minimum length.
 *
 * @param {string|number} phone
 * @returns {string} Clean digits prefixed with country code (e.g., "6281284079912") or empty string if invalid.
 */
export function normalizeWhatsAppNumber(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  if (cleaned.length < 9) {
    return "";
  }
  return cleaned;
}

/**
 * Builds a valid WhatsApp click-to-chat URL (https://wa.me/...).
 *
 * @param {string|number} phone - Target phone number
 * @param {string} [message=""] - Optional pre-filled text message
 * @returns {string} Fully encoded WhatsApp URL or empty string if phone is missing/invalid.
 */
export function buildWhatsAppUrl(phone, message = "") {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return "";
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${query}`;
}

/**
 * Returns a WhatsApp click-to-chat URL directed to the Foundation's official contact number.
 *
 * @param {string} [customMessage] - Optional custom message. Falls back to default consultation text.
 * @returns {string}
 */
export function getFoundationWhatsAppUrl(customMessage) {
  const fallbackMessage =
    "Assalamu'alaikum Admin Yayasan Payung Berkah, saya ingin bertanya seputar donasi & ZISWAF.";
  const message = customMessage !== undefined ? customMessage : fallbackMessage;
  return buildWhatsAppUrl(ORG_PROFILE.contacts.whatsapp || "6281284079912", message);
}
