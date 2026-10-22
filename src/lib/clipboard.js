/**
 * Universal clipboard copy helper with legacy fallback.
 * Works across modern browsers, non-HTTPS environments, and webviews.
 *
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - True if copied successfully
 */
export async function copyToClipboard(text) {
  if (!text || typeof window === "undefined") return false;

  // 1. Modern asynchronous Clipboard API (secure context)
  try {
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }

  // 2. Fallback using temporary hidden textarea (for non-secure or restricted contexts)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
