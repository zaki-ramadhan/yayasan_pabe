/**
 * SSE Broadcast Manager untuk Dashboard Admin Yayasan.
 * Memanfaatkan globalThis agar state koneksi persisten terhadap fast refresh di development.
 */

if (!globalThis.__pabe_sse_clients__) {
  globalThis.__pabe_sse_clients__ = new Set();
}

const clients = globalThis.__pabe_sse_clients__;

/**
 * Mendaftarkan stream controller client admin baru.
 * @param {ReadableStreamDefaultController} controller
 */
export function registerAdminSSEClient(controller) {
  clients.add(controller);
}

/**
 * Menghapus stream controller saat admin disconnect/tutup browser.
 * @param {ReadableStreamDefaultController} controller
 */
export function unregisterAdminSSEClient(controller) {
  clients.delete(controller);
}

/**
 * Mem-broadcast pesan real-time ke semua dashboard admin yang aktif.
 * @param {string} eventType - Tipe event (misal: 'DONATION_PAID', 'VOLUNTEER_CHECKIN')
 * @param {object} payload - Data event
 */
export function broadcastAdminEvent(eventType, payload = {}) {
  const encoder = new TextEncoder();
  const eventString = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  const encoded = encoder.encode(eventString);

  for (const controller of Array.from(clients)) {
    try {
      controller.enqueue(encoded);
    } catch {
      // Hapus controller yang sudah zombie / tertutup
      clients.delete(controller);
    }
  }
}
