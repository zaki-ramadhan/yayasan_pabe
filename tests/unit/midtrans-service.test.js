import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import {
  isMidtransProduction,
  getMidtransSnapApiUrl,
  getMidtransSnapScriptUrl,
  getMidtransAuthHeader,
  mapMidtransStatusToDomain,
} from "@/lib/midtransConfig";
import {
  verifyMidtransSignature,
  parseMidtransNotification,
} from "@/services/midtransService";

describe("Midtrans Configuration & Status Mapping", () => {
  it("memetakan status Midtrans ke domain status secara akurat", () => {
    expect(mapMidtransStatusToDomain("settlement")).toBe("PAID");
    expect(mapMidtransStatusToDomain("capture", "accept")).toBe("PAID");
    expect(mapMidtransStatusToDomain("capture", "challenge")).toBe("PENDING");
    expect(mapMidtransStatusToDomain("pending")).toBe("PENDING");
    expect(mapMidtransStatusToDomain("expire")).toBe("EXPIRED");
    expect(mapMidtransStatusToDomain("cancel")).toBe("CANCELLED");
    expect(mapMidtransStatusToDomain("deny")).toBe("CANCELLED");
  });

  it("menghasilkan URL API dan Script sesuai mode sandbox", () => {
    expect(getMidtransSnapApiUrl()).toContain("sandbox.midtrans.com");
    expect(getMidtransSnapScriptUrl()).toContain("sandbox.midtrans.com");
  });

  it("membuat Basic Auth header dengan enkripsi Base64 yang valid", () => {
    const authHeader = getMidtransAuthHeader();
    expect(authHeader).toMatch(/^Basic [A-Za-z0-9+/=]+$/);
  });
});

describe("Midtrans SHA-512 Signature & Notification Verification", () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "dummy-server-key";
  const orderId = "INV-20261029-TEST-001";
  const statusCode = "200";
  const grossAmount = "100000.00";

  // Hitung signature resmi: SHA512(order_id + status_code + gross_amount + ServerKey)
  const validSignature = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  it("memvalidasi signature SHA-512 yang sah", () => {
    const isValid = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey: validSignature,
    });
    expect(isValid).toBe(true);
  });

  it("menolak signature yang dimanipulasi atau nominal berbeda", () => {
    const isTampered = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount: "50000.00", // Tampered amount
      signatureKey: validSignature,
    });
    expect(isTampered).toBe(false);
  });

  it("mem-parsing notifikasi settlement webhook Midtrans secara lengkap", () => {
    const payload = {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: validSignature,
      transaction_status: "settlement",
      payment_type: "qris",
    };

    const parsed = parseMidtransNotification(payload);
    expect(parsed.isValid).toBe(true);
    expect(parsed.orderId).toBe(orderId);
    expect(parsed.isPaid).toBe(true);
    expect(parsed.status).toBe("PAID");
    expect(parsed.paymentType).toBe("qris");
    expect(parsed.grossAmount).toBe(100000);
  });
});
