/**
 * Helper pengujian E2E untuk interaksi elemen yang stabil dan natural
 */

/**
 * Scroll terarah ke elemen hanya jika elemen tersebut berada di luar tampilan viewport
 * @param {import('@playwright/test').Locator} locator
 * @param {number} delay
 */
export async function scrollToElement(locator, delay = 250) {
  await locator.scrollIntoViewIfNeeded();
  await locator.page().waitForTimeout(delay);
}

/**
 * Inisialisasi storage awal agar popup onboarding tour tidak memblokir interaksi
 * @param {import('@playwright/test').Page} page
 */
export async function setupE2EContext(page) {
  try {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  } catch {
    // Abaikan jika browser tidak mendukung API permission grant langsung
  }
  await page.addInitScript(() => {
    window.localStorage.setItem("pabe_tour_campaign_seen", "1");
    const applyHideFloating = () => {
      const container = document.head || document.documentElement;
      if (container && !document.getElementById("e2e-hide-floating")) {
        const style = document.createElement("style");
        style.id = "e2e-hide-floating";
        style.innerHTML = "#floating-whatsapp, [data-testid='floating-whatsapp'] { display: none !important; }";
        container.appendChild(style);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyHideFloating);
    } else {
      applyHideFloating();
    }
  });
}



