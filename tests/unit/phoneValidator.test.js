import { describe, it, expect } from "vitest";
import { validatePhone } from "@/lib/validator";

describe("Strict Indonesian Phone & WhatsApp Validator (Kominfo & ITU-T E.164)", () => {
  describe("Valid Phone Numbers", () => {
    it("menerima nomor 10 digit (kartu pascabayar/kartu lama)", () => {
      const res = validatePhone("0811234567");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("0811234567");
      expect(res.e164).toBe("62811234567");
    });

    it("menerima nomor 11 digit", () => {
      const res = validatePhone("085712345678");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("085712345678");
      expect(res.e164).toBe("6285712345678");
    });

    it("menerima nomor 12 digit (standar umum)", () => {
      const res = validatePhone("081298765432");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("081298765432");
      expect(res.e164).toBe("6281298765432");
    });

    it("menerima nomor 13 digit (kartu kuota/nomor baru generasi terkini)", () => {
      const res = validatePhone("0896123456789");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("0896123456789");
      expect(res.e164).toBe("62896123456789");
    });

    it("menormalkan format internasional +62 dan 62 ke format nasional 08", () => {
      const resPlus = validatePhone("+62 812-3456-7890");
      expect(resPlus.isValid).toBe(true);
      expect(resPlus.sanitized).toBe("081234567890");
      expect(resPlus.e164).toBe("6281234567890");

      const res62 = validatePhone("6281234567890");
      expect(res62.isValid).toBe(true);
      expect(res62.sanitized).toBe("081234567890");
      expect(res62.e164).toBe("6281234567890");
    });

    it("menerima nomor dengan spasi dan tanda hubung pemisah", () => {
      const res = validatePhone("0813-4567-8901");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("081345678901");
    });
  });

  describe("Invalid Phone Numbers & Security Rejections", () => {
    it("menolak nomor kosong jika isRequired bernilai true", () => {
      const resEmpty = validatePhone("");
      expect(resEmpty.isValid).toBe(false);
      expect(resEmpty.message).toMatch(/wajib diisi/i);

      const resNull = validatePhone(null);
      expect(resNull.isValid).toBe(false);
    });

    it("menerima nomor kosong jika isRequired bernilai false (field opsional)", () => {
      const res = validatePhone("", { isRequired: false });
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("");
    });

    it("menolak nomor yang terlalu pendek (< 10 digit)", () => {
      const res = validatePhone("081234567"); // 9 digit
      expect(res.isValid).toBe(false);
      expect(res.message).toMatch(/terlalu pendek/i);
    });

    it("menolak nomor yang terlalu panjang (> 13 digit untuk format 08)", () => {
      const res = validatePhone("08123456789012"); // 14 digit
      expect(res.isValid).toBe(false);
      expect(res.message).toMatch(/terlalu panjang/i);
    });

    it("menolak awalan bukan 08 atau 628", () => {
      expect(validatePhone("07123456789").isValid).toBe(false);
      expect(validatePhone("02188889999").isValid).toBe(false); // telepon kabel
      expect(validatePhone("12345678901").isValid).toBe(false);
      expect(validatePhone("+14155552671").isValid).toBe(false); // nomor luar negeri
    });

    it("menolak awalan 080x (nomor bebas pulsa / toll-free / call center)", () => {
      const res = validatePhone("08001234567");
      expect(res.isValid).toBe(false);
      expect(res.message).toMatch(/bebas pulsa/i);
    });

    it("menolak pola angka berulang identik fiktif (anti-trolling)", () => {
      const res1 = validatePhone("081111111111");
      expect(res1.isValid).toBe(false);
      expect(res1.message).toMatch(/fiktif/i);

      const res9 = validatePhone("089999999999");
      expect(res9.isValid).toBe(false);
      expect(res9.message).toMatch(/fiktif/i);
    });

    it("menghasilkan label fieldName yang dinamis pada pesan kesalahan", () => {
      const res = validatePhone("08123", { fieldName: "Nomor telepon staf" });
      expect(res.message).toMatch(/Nomor telepon staf terlalu pendek/i);
    });
  });
});
