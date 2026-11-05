import { describe, it, expect } from "vitest";
import { ORG_PROFILE } from "@/data/orgProfile";
import {
  getCustomerServices,
  buildTelUrl,
  buildWhatsAppUrl,
  getFoundationWhatsAppUrl,
} from "@/lib/whatsappUtils";

describe("Customer Service & Contact Multi-Channel Routing", () => {
  describe("Domain & SSOT Contacts", () => {
    it("mempertahankan struktur kontak utama untuk backward compatibility", () => {
      expect(ORG_PROFILE.contacts.phone).toBe("(021) 38857042");
      expect(ORG_PROFILE.contacts.whatsapp).toBe("+62 812-8407-9912");
      expect(ORG_PROFILE.contacts.whatsappAlt).toBe("+62 812-8510-9476");
    });

    it("menyediakan 3 lini admin layanan lengkap dengan pesan awal", () => {
      const services = getCustomerServices();
      expect(services).toHaveLength(3);

      const [cs1, cs2, cs3] = services;
      expect(cs1.name).toBe("Admin Layanan 1");
      expect(cs1.phone).toBe("+62 812-8407-9912");
      expect(cs1.isPrimary).toBe(true);

      expect(cs2.name).toBe("Admin Layanan 2");
      expect(cs2.phone).toBe("+62 812-8510-9476");
      expect(cs2.isPrimary).toBe(false);

      expect(cs3.name).toBe("Admin Layanan 3");
      expect(cs3.phone).toBe("+62 813-8028-7311");
      expect(cs3.isPrimary).toBe(false);
    });
  });

  describe("Utility Formatter & Link Generator", () => {
    it("membangun tautan telepon protokol tel: dengan sanitasi non-digit", () => {
      expect(buildTelUrl("(021) 38857042")).toBe("tel:02138857042");
      expect(buildTelUrl("+62 21 38857042")).toBe("tel:+622138857042");
      expect(buildTelUrl("")).toBe("");
      expect(buildTelUrl(null)).toBe("");
    });

    it("membangun URL WhatsApp click-to-chat dengan encoding pesan aman", () => {
      const url = buildWhatsAppUrl("+62 812-8407-9912", "Halo Yayasan");
      expect(url).toBe("https://wa.me/6281284079912?text=Halo%20Yayasan");
    });

    it("getFoundationWhatsAppUrl menggunakan CS utama sebagai fallback default", () => {
      const url = getFoundationWhatsAppUrl();
      expect(url).toContain("https://wa.me/6281284079912");
      expect(url).toContain("Payung%20Berkah");
    });
  });
});
